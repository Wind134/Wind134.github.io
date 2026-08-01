(() => {
  const studio = document.querySelector('[data-content-studio]');
  if (!studio) return;

  const elements = {
    pickRoot: document.querySelector('#studio-pick-root'),
    rootStatus: document.querySelector('#studio-root-status'),
    fileInput: document.querySelector('#studio-files'),
    dropzone: document.querySelector('#studio-dropzone'),
    fileList: document.querySelector('#studio-file-list'),
    title: document.querySelector('#studio-title'),
    date: document.querySelector('#studio-date'),
    slug: document.querySelector('#studio-slug'),
    categories: document.querySelector('#studio-categories'),
    tags: document.querySelector('#studio-tags'),
    postPath: document.querySelector('#studio-post-path'),
    imagePath: document.querySelector('#studio-image-path'),
    write: document.querySelector('#studio-write'),
    download: document.querySelector('#studio-download'),
    copyCommand: document.querySelector('#studio-copy-command'),
    message: document.querySelector('#studio-message')
  };

  const state = {
    rootHandle: null,
    markdownFile: null,
    markdownSource: '',
    imageFiles: []
  };

  function todayInShanghai() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }

  function safePart(value, fallback = 'untitled') {
    return value
      .normalize('NFKC')
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '') || fallback;
  }

  function safeImageName(value) {
    const extensionIndex = value.lastIndexOf('.');
    if (extensionIndex < 1) return safePart(value, 'image');

    const basename = safePart(value.slice(0, extensionIndex), 'image');
    const extension = value.slice(extensionIndex).replace(/[^.a-zA-Z0-9]/g, '').toLowerCase();
    return `${basename}${extension}`;
  }

  function isValidDate(value) {
    const date = new Date(`${value}T00:00:00Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      && !Number.isNaN(date.valueOf())
      && date.toISOString().slice(0, 10) === value;
  }

  function scalar(value) {
    const trimmed = value.trim();
    if (!trimmed) return '';

    if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
      || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      try {
        return trimmed.startsWith('"')
          ? JSON.parse(trimmed)
          : trimmed.slice(1, -1).replace(/''/g, "'");
      } catch (_error) {
        return trimmed.slice(1, -1);
      }
    }

    return trimmed;
  }

  function listValue(value) {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [scalar(trimmed)];

    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => scalar(item))
      .filter(Boolean);
  }

  function frontMatterValue(block, key) {
    const lines = block.split(/\r?\n/);
    const index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (index < 0) return '';

    const inline = lines[index].slice(key.length + 1).trim();
    if (inline) return inline;

    const nested = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const match = lines[cursor].match(/^\s*-\s*(.+)$/);
      if (!match) break;
      nested.push(scalar(match[1]));
    }
    return nested;
  }

  function parseFrontMatter(source) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    const block = match ? match[1] : '';
    const categories = frontMatterValue(block, 'categories');
    const tags = frontMatterValue(block, 'tags');
    const date = scalar(frontMatterValue(block, 'date')).slice(0, 10);

    return {
      title: scalar(frontMatterValue(block, 'title')),
      date: isValidDate(date) ? date : '',
      categories: Array.isArray(categories) ? categories : listValue(categories),
      tags: Array.isArray(tags) ? tags : listValue(tags)
    };
  }

  function slugFromFilename(filename) {
    return safePart(
      filename
        .replace(/\.(md|markdown)$/i, '')
        .replace(/^\d{4}-\d{2}-\d{2}-/, ''),
      'article'
    ).toLowerCase();
  }

  function categoryParts() {
    return elements.categories.value
      .split('/')
      .map((item) => safePart(item.trim(), ''))
      .filter(Boolean);
  }

  function tagParts() {
    return elements.tags.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function metadata() {
    const categories = categoryParts();
    const slug = safePart(elements.slug.value, 'article').toLowerCase();
    const date = elements.date.value;

    return {
      title: elements.title.value.trim(),
      date,
      slug,
      categories,
      tags: tagParts(),
      postFilename: `${date}-${slug}.md`,
      postPath: `_posts/${categories.join('/')}/${date}-${slug}.md`,
      imagePath: `assets/img/posts/${slug}/`
    };
  }

  function validationError() {
    if (!state.markdownFile) return '请选择一篇 Markdown 文件';
    if (!elements.title.value.trim()) return '请填写文章标题';
    if (!isValidDate(elements.date.value)) return '请选择有效发布日期';
    if (!elements.slug.value.trim()) return '请填写 Slug';
    if (categoryParts().length === 0) return '请填写至少一个分类';
    if (elements.tags.value.includes('，')) return '标签请使用英文逗号分隔';
    return '';
  }

  function setMessage(message, type = '') {
    elements.message.textContent = message;
    elements.message.className = `studio-message${type ? ` is-${type}` : ''}`;
  }

  function updatePreview(announce = true) {
    const meta = metadata();
    const error = validationError();

    elements.slug.value = meta.slug;
    elements.postPath.textContent = meta.categories.length > 0 && isValidDate(meta.date)
      ? meta.postPath
      : '_posts/分类/YYYY-MM-DD-slug.md';
    elements.imagePath.textContent = meta.imagePath;
    elements.write.disabled = Boolean(error) || !state.rootHandle;
    elements.download.disabled = Boolean(error);
    elements.copyCommand.disabled = Boolean(error);

    if (!announce) return;
    if (error && state.markdownFile) setMessage(error, 'warning');
    else if (!error && !window.showDirectoryPicker) {
      setMessage('文章信息已就绪，可下载整理稿后手动放入预览路径。', 'ready');
    } else if (!error && !state.rootHandle) setMessage('文章信息已就绪，请选择博客仓库目录。');
    else if (!error) setMessage('准备完成，确认路径后即可写入。', 'ready');
    else setMessage('');
  }

  function renderFileList() {
    elements.fileList.replaceChildren();
    const files = state.markdownFile ? [state.markdownFile, ...state.imageFiles] : [];

    if (files.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'is-empty';
      empty.textContent = '尚未选择内容文件';
      elements.fileList.append(empty);
      return;
    }

    for (const file of files) {
      const item = document.createElement('li');
      const icon = document.createElement('i');
      const details = document.createElement('span');
      const name = document.createElement('strong');
      const size = document.createElement('small');

      icon.className = file === state.markdownFile ? 'fas fa-file-lines' : 'fas fa-image';
      name.textContent = file.name;
      size.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB`;
      details.append(name, size);
      item.append(icon, details);
      elements.fileList.append(item);
    }
  }

  async function loadFiles(fileList) {
    const files = Array.from(fileList);
    const markdownFiles = files.filter((file) => /\.(md|markdown)$/i.test(file.name));

    if (markdownFiles.length !== 1) {
      setMessage('每次请选择且只选择一篇 Markdown 文件。', 'error');
      return;
    }

    const images = files.filter((file) => file.type.startsWith('image/')
      || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name));
    const safeNames = images.map((file) => safeImageName(file.name));
    if (new Set(safeNames).size !== safeNames.length) {
      setMessage('配图整理后的文件名发生重复，请先重命名。', 'error');
      return;
    }

    state.markdownFile = markdownFiles[0];
    state.imageFiles = images;
    state.markdownSource = await state.markdownFile.text();

    const parsed = parseFrontMatter(state.markdownSource);
    elements.title.value = parsed.title || slugFromFilename(state.markdownFile.name);
    elements.date.value = parsed.date || todayInShanghai();
    elements.slug.value = slugFromFilename(state.markdownFile.name);
    elements.categories.value = parsed.categories.join('/');
    elements.tags.value = parsed.tags.join(', ');

    renderFileList();
    updatePreview();
  }

  function upsertLine(lines, key, value) {
    const index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (index < 0) {
      lines.push(`${key}: ${value}`);
      return;
    }

    let end = index + 1;
    while (end < lines.length && /^\s*-\s+/.test(lines[end])) end += 1;
    lines.splice(index, end - index, `${key}: ${value}`);
  }

  function normalizedMarkdown(meta) {
    const eol = state.markdownSource.includes('\r\n') ? '\r\n' : '\n';
    const match = state.markdownSource.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    const lines = match ? match[1].split(/\r?\n/) : [];
    const body = match ? state.markdownSource.slice(match[0].length) : state.markdownSource;

    upsertLine(lines, 'title', JSON.stringify(meta.title));
    if (!lines.some((line) => line.startsWith('author:'))) lines.push('author: Ping');
    upsertLine(lines, 'date', `${meta.date} 12:00:00 +0800`);
    upsertLine(lines, 'categories', `[${meta.categories.map((item) => JSON.stringify(item)).join(', ')}]`);
    upsertLine(lines, 'tags', `[${meta.tags.map((item) => JSON.stringify(item)).join(', ')}]`);
    if (!lines.some((line) => line.startsWith('toc:'))) lines.push('toc: true');
    if (!lines.some((line) => line.startsWith('comments:'))) lines.push('comments: true');
    if (state.imageFiles.length > 0) upsertLine(lines, 'img_path', `/${meta.imagePath}`);

    return `---${eol}${lines.join(eol)}${eol}---${eol}${eol}${body.replace(/^(?:\r?\n)+/, '')}`;
  }

  async function nestedDirectory(rootHandle, parts) {
    let directory = rootHandle;
    for (const part of parts) {
      directory = await directory.getDirectoryHandle(part, { create: true });
    }
    return directory;
  }

  async function fileExists(directory, filename) {
    try {
      await directory.getFileHandle(filename);
      return true;
    } catch (error) {
      if (error.name === 'NotFoundError') return false;
      throw error;
    }
  }

  async function writeFile(directory, filename, content) {
    const handle = await directory.getFileHandle(filename, { create: true });
    const writer = await handle.createWritable();
    await writer.write(content);
    await writer.close();
  }

  async function chooseRoot() {
    if (!window.showDirectoryPicker) return;

    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await handle.getFileHandle('_config.yml');
      state.rootHandle = handle;
      elements.rootStatus.textContent = `已选择：${handle.name}`;
      elements.rootStatus.classList.add('is-ready');
      updatePreview();
    } catch (error) {
      if (error.name === 'AbortError') return;
      state.rootHandle = null;
      elements.rootStatus.textContent = '所选目录不是博客仓库根目录（未找到 _config.yml）';
      elements.rootStatus.classList.remove('is-ready');
      updatePreview(false);
      setMessage('请选择包含 _config.yml 的仓库根目录。', 'error');
    }
  }

  async function writeToBlog() {
    const error = validationError();
    if (error || !state.rootHandle) {
      setMessage(error || '请先选择博客仓库目录。', 'error');
      return;
    }

    const meta = metadata();
    elements.write.disabled = true;
    setMessage('正在整理并写入文件……');

    try {
      const postDirectory = await nestedDirectory(state.rootHandle, ['_posts', ...meta.categories]);
      const postAlreadyExists = await fileExists(postDirectory, meta.postFilename);
      let imageDirectory = null;
      const existingImages = [];

      if (state.imageFiles.length > 0) {
        imageDirectory = await nestedDirectory(state.rootHandle, ['assets', 'img', 'posts', meta.slug]);
        for (const image of state.imageFiles) {
          const filename = safeImageName(image.name);
          if (await fileExists(imageDirectory, filename)) existingImages.push(filename);
        }
      }

      const conflicts = [
        ...(postAlreadyExists ? [meta.postFilename] : []),
        ...existingImages
      ];
      if (conflicts.length > 0
        && !window.confirm(`以下文件已存在：\n${conflicts.join('\n')}\n\n是否覆盖？`)) {
        setMessage('已取消写入，原文件没有变化。', 'warning');
        return;
      }

      await writeFile(postDirectory, meta.postFilename, normalizedMarkdown(meta));

      if (imageDirectory) {
        for (const image of state.imageFiles) {
          await writeFile(imageDirectory, safeImageName(image.name), image);
        }
      }

      setMessage(`写入完成：${meta.postPath}，现在可以回到终端检查并提交。`, 'success');
    } catch (writeError) {
      setMessage(`写入失败：${writeError.message}`, 'error');
    } finally {
      updatePreview(false);
    }
  }

  async function copyPublishCommand() {
    const meta = metadata();
    const imageTarget = state.imageFiles.length > 0 ? ` ${meta.imagePath}` : '';
    const command = `git add -- ${meta.postPath}${imageTarget} && git commit -m "docs: add article"`;

    try {
      await navigator.clipboard.writeText(command);
      setMessage('发布命令已复制。', 'success');
    } catch (_error) {
      setMessage(command, 'ready');
    }
  }

  function downloadMarkdown() {
    const error = validationError();
    if (error) {
      setMessage(error, 'error');
      return;
    }

    const meta = metadata();
    const blob = new Blob([normalizedMarkdown(meta)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = meta.postFilename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(`已下载 ${meta.postFilename}，配图请按预览路径整理。`, 'success');
  }

  elements.date.value = todayInShanghai();

  if (!window.showDirectoryPicker) {
    elements.pickRoot.disabled = true;
    elements.rootStatus.textContent = '当前浏览器不支持本地目录写入，请使用最新版 Chrome 或 Edge。';
    setMessage('仍可整理并下载 Markdown，但无法直接写入本地仓库。', 'warning');
  }

  elements.pickRoot.addEventListener('click', chooseRoot);
  elements.fileInput.addEventListener('change', (event) => loadFiles(event.target.files));
  elements.write.addEventListener('click', writeToBlog);
  elements.download.addEventListener('click', downloadMarkdown);
  elements.copyCommand.addEventListener('click', copyPublishCommand);

  for (const input of [elements.title, elements.date, elements.slug, elements.categories, elements.tags]) {
    input.addEventListener('input', () => updatePreview());
  }

  for (const eventName of ['dragenter', 'dragover']) {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.add('is-dragging');
    });
  }

  for (const eventName of ['dragleave', 'drop']) {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove('is-dragging');
    });
  }

  elements.dropzone.addEventListener('drop', (event) => loadFiles(event.dataTransfer.files));
  updatePreview();
})();
