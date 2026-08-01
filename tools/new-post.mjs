#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

function option(name, fallback = '') {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) return args[index + 1];

  const prefix = `--${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  return inline ? inline.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function fail(message) {
  console.error(`错误：${message}`);
  process.exit(1);
}

function help() {
  console.log(`用法：
  npm run post:new -- --title "文章标题" --category "Go/语言学习" --tags "Go,编程"

选项：
  --title       文章标题，必填
  --category    分类路径，使用 / 分隔，必填
  --tags        标签，使用英文逗号分隔
  --slug        URL 文件名，不填则根据标题生成
  --date        日期，格式 YYYY-MM-DD，默认使用上海时区今天
  --draft       创建到 _drafts，而不是 _posts
  --help        显示帮助`);
}

if (hasFlag('help')) {
  help();
  process.exit(0);
}

const title = option('title');
const category = option('category');
const tagsInput = option('tags');
const tags = tagsInput
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean);

if (!title) fail('--title 不能为空');
if (!category) fail('--category 不能为空，例如 Go/语言学习');
if (category.includes('，')) fail('--category 请使用英文 / 分隔，不要使用中文逗号');
if (tagsInput.includes('，')) fail('--tags 请使用英文逗号分隔');

const date = option(
  'date',
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
);

const parsedDate = new Date(`${date}T00:00:00Z`);
const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
  && !Number.isNaN(parsedDate.valueOf())
  && parsedDate.toISOString().slice(0, 10) === date;

if (!isValidDate) fail('--date 必须是有效的 YYYY-MM-DD 日期');

const safePart = (value) => value
  .normalize('NFKC')
  .replace(/[<>:"/\\|?*]/g, '-')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^[-.]+|[-.]+$/g, '') || 'untitled';

const slug = safePart(option('slug', title)).toLowerCase();
const categories = category
  .split('/')
  .map((item) => safePart(item.trim()))
  .filter(Boolean);

if (categories.length === 0) fail('至少需要一个分类');

const root = hasFlag('draft') ? '_drafts' : '_posts';
const directory = path.join(root, ...categories);
const filename = hasFlag('draft') ? `${slug}.md` : `${date}-${slug}.md`;
const target = path.join(directory, filename);

if (fs.existsSync(target)) fail(`文件已存在：${target}`);

const frontMatter = `---
title: ${JSON.stringify(title)}
author: Ping
date: ${date} 12:00:00 +0800
categories: [${categories.map((item) => JSON.stringify(item)).join(', ')}]
tags: [${tags.map((item) => JSON.stringify(item)).join(', ')}]
description: ""
toc: true
comments: true
# img_path: /assets/img/posts/${slug}/
# image:
#   path: cover.webp
#   alt: ""
---

## 摘要

在这里写下这篇文章要解决的问题。

## 正文

开始记录……
`;

fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(target, frontMatter, 'utf8');

console.log(`已创建：${target}`);
console.log(`文章图片建议放在：assets/img/posts/${slug}/`);
