# 内容管理约定

## 文章

新文章使用以下命令创建：

```bash
npm run post:new -- --title "文章标题" --category "主题/子主题" --tags "标签一,标签二"
```

分类使用 `/` 表示层级，标签使用英文逗号分隔。文章的分类和标签以 Front Matter 为准，目录只是帮助人查找文件。

也可以在本地预览或部署后打开 `/studio/`，使用“上传文章”工作台：

1. 点击“选择博客仓库目录”，授权包含 `_config.yml` 的仓库根目录。
2. 拖入一篇 Markdown 和相关配图。
3. 检查标题、日期、分类、标签和目标路径。
4. 点击“写入本地博客”，再回到终端检查 Git 改动并提交。

工作台使用浏览器 File System Access API，文件只写入用户主动授权的本地目录。推荐使用最新版 Chrome 或 Edge；不支持该 API 的浏览器仍可预览文件信息，但不能直接写入目录。

推荐的 Front Matter：

```yaml
---
title: "文章标题"
author: Ping
date: 2026-08-01 12:00:00 +0800
categories: [Go, 语言学习]
tags: [Go, 编程]
description: "一句话介绍文章内容"
toc: true
comments: true
img_path: /assets/img/posts/article-slug/
image:
  path: cover.webp
  alt: "文章封面"
---
```

没有封面时可以删除 `image`，首页会使用分类渐变色作为默认封面。

## 图片

新文章的图片放在：

```text
assets/img/posts/article-slug/
```

正文中使用相对文件名，例如 `![](diagram.svg)`；Front Matter 中的 `img_path` 负责把它映射到对应目录。封面图片通过 `image.path` 配置。

## 发布

本项目仍然是静态 GitHub Pages。新增文章后提交并推送到 `main`，GitHub Actions 会检查内容、构建前端资源、构建 Jekyll 网站并部署。暂不提供在线后台上传，因此不会把 GitHub 写入令牌暴露在浏览器中。
