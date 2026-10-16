# 博客搭建手册（Hexo + Fluid + GitHub Pages）

全部代码骨架已经生成好了，你只需要按顺序跑几条命令。

---

## 0. 先确认环境

打开 PowerShell 或 Git Bash：

```bash
node -v   # 必须 >= 20.19.0，低于这个就先升级 Node
git -v    # 能出版本号就行
```

顺便需要一个 GitHub 账号。

---

## 1. 安装依赖

```bash
cd C:/Users/权/WorkBuddy/2026-10-16-12-29-21/blog
npm install
```

> 为什么这步必须你跑：npm 会把几百个包装到你本机磁盘，属于「安装」动作，我不代跑。
> 装完会多出 `node_modules/` 和 `package-lock.json`，这两个已经在 .gitignore 里，不会上传。

---

## 2. 本地看效果

```bash
npx hexo server
```

浏览器打开 http://localhost:4000 。Ctrl+C 停止。

看到首页就算成功。此时改动文章，刷新页面即可（改配置文件要重启）。

---

## 3. 改成你自己的信息

**`_config.yml`** —— 只改这几行：

| 键 | 改成 |
| --- | --- |
| `title` | 你的博客名 |
| `author` | 你的名字 |
| `url` | `https://timekeeper7777777.github.io` |

**`_config.fluid.yml`** —— 导航、搜索、页脚。想改更多就去 `node_modules/hexo-theme-fluid/_config.yml` 里抄完整配置项，粘到这个文件里覆盖默认值。

**`source/about/index.md`** —— 关于页的自我介绍。

改完之后跑一次 `npx hexo clean`，Hexo 有缓存，不清不生效。

---

## 4. 推到 GitHub 并上线

### 4.1 建仓库

GitHub 网页 → New repository → 仓库名**必须**叫 `timekeeper7777777.github.io`（小写）。这样域名就是 `https://timekeeper7777777.github.io`，不用配子路径。
仓库设为 Public，不要勾 README / .gitignore（本地已经有了）。

### 4.2 推送代码

```bash
cd C:/Users/权/WorkBuddy/2026-10-16-12-29-21/blog
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/timekeeper7777777/timekeeper7777777.github.io.git
git push -u origin main
```

### 4.3 打开 GitHub Pages

仓库 → **Settings** → **Pages** → Source 下拉选 **GitHub Actions**。

这一步必须做，否则 Actions 构建完了也没地方发布。选完之后，`.github/workflows/deploy.yml` 会在每次 push 时自动：装依赖 → 生成 public/ → 部署。

去看 **Actions** 标签页，绿色对勾 = 上线成功，网址在 Deploy 任务的输出里。

---

## 5. 以后怎么写文章

```bash
npx hexo new "取证笔记：磁盘镜像挂载"
```

会在 `source/_posts/` 生成 `取证笔记：磁盘镜像挂载.md`，用 Typora / VS Code 打开写 Markdown 就行。

```bash
git add .
git commit -m "new post"
git push
```

推上去大约 1 分钟自动上线。

---

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npx hexo new "标题"` | 新建文章 |
| `npx hexo s` | 本地预览 |
| `npx hexo g` | 生成静态页面到 public/ |
| `npx hexo clean` | 清缓存（改完配置必跑） |

## 两个坑

1. **放图片**：`post_asset_folder: true` 已开启，`hexo new` 时会同时建一个同名文件夹，图片丢进去，文中用 `{% asset_img 图.png %}` 引用。别用绝对路径，本地和线上会不一致。
2. **国内访问慢**：GitHub Pages 在国内时快时慢，这是它免费的代价。真受不了再换 Vercel 或买域名套 CDN，到时候再说。

## 目录结构

```
blog/
├── _config.yml            站点主配置
├── _config.fluid.yml      主题配置
├── package.json           依赖清单
├── scaffolds/post.md      新建文章的模板
├── source/
│   ├── _posts/            文章都在这
│   └── about/             关于页
└── .github/workflows/     自动部署
```

---

## 部署到 Cloudflare Pages（推荐）

你现在已经能把 Github Pages 用起来了，但它在国内时快时慢。加一层 Cloudflare Pages 就能解决：**同一个仓库，push 一次，两边同时更新**，互不影响。

### 一次性配置（约 3 分钟）

1. 登录 https://dash.cloudflare.com
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 GitHub，选中 `timekeeper7777777.github.io` 仓库
4. 填构建配置（**照抄，别用预设**）：

| 字段 | 值 |
| --- | --- |
| Project name | `blog-timekeeper`（决定你的域名，随便起） |
| Framework preset | `None` |
| Root directory | `/` |
| Build command | `npm run build` |
| Build output directory | `public` |
| Node version（环境变量） | `22` |

5. 点 **Save and Deploy**，等一两分钟，会给你一个 `blog-timekeeper.pages.dev` 的域名

### 为什么必须设 Node 版本

`hexo 8` 要求 Node **≥ 20.19**，而 Cloudflare 的默认版本可能偏低，不设就会构建失败。仓库里已经放了两个保险：`.nvmrc`（内容 `22`）和 `package.json` 里的 `engines.node`，但**面板里显式设一次最稳**。

### 免费额度够用吗

| 项 | 免费额度 |
| --- | --- |
| 构建次数 | 每月 500 次（你一天推 10 次都用不完） |
| 流量 | 不限量 |
| 自定义域名 | 支持，自带 HTTPS 证书 |
| 费用 | 0 元，不要信用卡 |

### 日常

什么都不用做。写完文章 `git push`，GitHub Actions 和 Cloudflare Pages 会各自自动更新。

想绑自己的域名：Pages 项目 → **Custom domains** → 按提示添加即可（域名要花钱买，`.pages.dev` 永久免费）。
