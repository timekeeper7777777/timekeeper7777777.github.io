---
title: 第一篇：博客搭好了
date: 2026-10-16 12:40:00
tags:
  - 建站
  - Hexo
categories:
  - 折腾记录
---

## 为什么写这个博客

把自己的学习过程写下来。技术笔记不写下来，两周后就跟没学过一样。

## 这篇文章里能验证的功能

### 代码块（带行号）

```python
def count_lines(path: str) -> int:
    with open(path, "r", encoding="utf-8") as f:
        return sum(1 for _ in f)

print(count_lines("test.txt"))
```

```bash
hexo new "文章标题"
hexo clean && hexo generate && hexo server
```

### 列表

1. 新建文章：`hexo new "标题"`
2. 本地预览：`hexo server`，浏览器打开 http://localhost:4000
3. 写完了推到 GitHub，Actions 自动部署

### 引用

> 静态站 = 提前把页面算好，访客来了直接拿。

### 表格

| 命令 | 作用 |
| --- | --- |
| `hexo new` | 新建文章 |
| `hexo g` | 生成静态文件到 public/ |
| `hexo s` | 本地预览 |
| `hexo clean` | 清缓存，改配置后必须跑 |

## 下一步

把 `_config.yml` 里的 `url` 和作者信息改成你自己的。
