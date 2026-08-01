#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const errors = [];
const warnings = [];
const posts = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.md')) posts.push(target);
  }
}

function lineValue(frontMatter, key) {
  const line = frontMatter.split(/\r?\n/).find((item) => item.startsWith(`${key}:`));
  return line ? line.slice(key.length + 1).trim() : '';
}

function parseList(value) {
  if (!value.startsWith('[') || !value.endsWith(']')) return [];
  return value
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function isValidDate(value) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:\s|$)/);
  if (!match) return false;

  const date = new Date(`${match[1]}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === match[1];
}

walk('_posts');

for (const file of posts) {
  const relative = file.split(path.sep).join('/');
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    errors.push(`${relative}: 缺少 Front Matter`);
    continue;
  }

  const frontMatter = match[1];
  for (const key of ['title', 'date', 'categories', 'tags']) {
    if (!lineValue(frontMatter, key)) errors.push(`${relative}: 缺少 ${key}`);
  }

  const categories = parseList(lineValue(frontMatter, 'categories'));
  const tags = parseList(lineValue(frontMatter, 'tags'));
  const date = lineValue(frontMatter, 'date');
  const filename = path.basename(relative);

  if (date && !isValidDate(date)) errors.push(`${relative}: date 不是有效日期`);

  if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(filename)) {
    warnings.push(`${relative}: 文件名建议使用 YYYY-MM-DD-slug.md`);
  }

  if (lineValue(frontMatter, 'categories').includes('，')) {
    errors.push(`${relative}: categories 使用了中文逗号，请改为英文逗号`);
  }

  if (lineValue(frontMatter, 'tags').includes('，')) {
    errors.push(`${relative}: tags 使用了中文逗号，请改为英文逗号`);
  }

  if (categories.length === 0) errors.push(`${relative}: categories 必须是非空数组`);
  if (tags.length === 0) warnings.push(`${relative}: tags 为空，建议至少添加一个标签`);
}

if (errors.length > 0) {
  console.error('内容检查失败：');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
}

if (warnings.length > 0) {
  console.warn('\n内容提示：');
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length === 0) {
  console.log(`内容检查通过：${posts.length} 篇文章`);
}
