// ============================================
// 文章渲染管理
// ============================================

import { buildTOC } from './ui/toc.js';
import { addComments } from './features/comments.js';
import { initAnalytics, renderAnalytics } from './features/analytics.js';
import { fetchArticlesIndex } from './features/articles-source.js';

let initialized = false;
let currentArticleId = null;
let currentArticle = null;
let articleContentEl = null;
let articleHeadlineEl = null;
let articleCommentsHostEl = null;
let highlightThemeBound = false;
let currentSourcePath = '';

export function initArticle() {
  if (initialized) return;

  articleContentEl = document.getElementById('article-content');
  articleHeadlineEl = document.getElementById('article-headline');
  articleCommentsHostEl = document.getElementById('article-comments-host');

  if (!articleContentEl || !articleHeadlineEl || !articleCommentsHostEl) {
    console.error('Article content element not found');
    return;
  }

  initMarkdownParser();
  initCodeHighlight();

  window.addEventListener('resize', () => {
    updateTocOffset();
  });

  initialized = true;
}

export async function loadArticle(articleId) {
  if (!initialized) {
    initArticle();
  }

  currentArticleId = articleId;
  showLoading();

  try {
    const list = await fetchArticlesIndex();
    const article = list.find(a => a.id === articleId);

    if (!article) {
      showError('文章不存在');
      return;
    }

    currentArticle = article;
    await loadArticleFile(article.file);

  } catch (error) {
    console.error('Error loading article:', error);
    showError('加载文章失败，请稍后重试');
  }
}

async function loadArticleFile(filename) {
  try {
    const sourcePath = `articles/${filename}`;
    const response = await fetch(sourcePath, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }

    const content = await response.text();
    const fileExtension = filename.split('.').pop().toLowerCase();
    currentSourcePath = sourcePath;

    if (fileExtension === 'md') {
      renderMarkdown(content, sourcePath);
    } else if (fileExtension === 'html') {
      renderHTML(content, sourcePath);
    } else {
      renderHTML(content, sourcePath);
    }

  } catch (error) {
    console.error('Error loading article file:', error);
    showError('加载文章内容失败');
  }
}

export async function loadDocumentByPath(docPath) {
  const normalizedPath = normalizeDocPath(docPath);
  if (!normalizedPath) {
    showError('文档路径无效');
    throw new Error('Invalid document path');
  }

  showLoading();
  currentArticleId = '';

  try {
    const response = await fetch(normalizedPath, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load ${normalizedPath}`);
    }

    const content = await response.text();
    const fileExtension = normalizedPath.split('.').pop().toLowerCase();
    const meta = extractDocMeta(normalizedPath, content);

    currentArticle = {
      id: '',
      title: meta.title,
      date: meta.date || '',
      tags: meta.tags || []
    };
    currentSourcePath = normalizedPath;

    if (fileExtension === 'md') {
      renderMarkdown(content, normalizedPath);
    } else {
      renderHTML(content, normalizedPath);
    }
    return true;
  } catch (error) {
    console.error('Error loading document by path:', error);
    showError('加载文档失败，请确认链接路径');
    throw error;
  }
}

function initMarkdownParser() {
  if (typeof marked === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Marked.js loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Marked.js');
    };
    document.head.appendChild(script);
  }
}

function initCodeHighlight() {
  ensureHighlightThemeLink();

  if (typeof hljs === 'undefined') {
    const bundleScript = document.createElement('script');
    bundleScript.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/highlight.min.js';
    bundleScript.async = true;
    document.head.appendChild(bundleScript);
  }

  if (!highlightThemeBound) {
    window.addEventListener('appearancechange', () => {
      const themeLink = document.getElementById('hljs-theme');
      if (!themeLink) return;
      themeLink.href = getHighlightThemeHref();
    });
    highlightThemeBound = true;
  }
}

function renderMarkdown(content, sourcePath) {
  if (typeof marked === 'undefined') {
    setTimeout(() => {
      if (typeof marked !== 'undefined') {
        renderMarkdown(content, sourcePath);
      } else {
        showError('Markdown 解析器加载失败');
      }
    }, 100);
    return;
  }

  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
      if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (error) {
          console.error('Highlight error:', error);
        }
      }
      return code;
    }
  });

  const markdownWithoutFrontMatter = stripFrontMatter(content);
  const html = marked.parse(markdownWithoutFrontMatter);

  renderArticleHeadline();
  articleContentEl.innerHTML = `
    <div class="article-body">${html}</div>
  `;

  enhanceArticleLinks(sourcePath);
  buildTOC(articleContentEl);
  renderAnalytics(articleHeadlineEl);
  addComments(articleCommentsHostEl);
  initAnalytics();
  updateTocOffset();
}

function renderHTML(content, sourcePath) {
  renderArticleHeadline();
  articleContentEl.innerHTML = `
    <div class="article-body">${content}</div>
  `;

  if (typeof hljs !== 'undefined') {
    articleContentEl.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  enhanceArticleLinks(sourcePath);
  buildTOC(articleContentEl);
  renderAnalytics(articleHeadlineEl);
  addComments(articleCommentsHostEl);
  initAnalytics();
  updateTocOffset();
}

function renderArticleHeadline() {
  if (!articleHeadlineEl || !currentArticle) return;

  articleHeadlineEl.innerHTML = `
    <h1 class="article-title">${escapeHtml(currentArticle.title || '无标题')}</h1>
    <div class="article-meta">
      <span class="article-date">${formatDate(currentArticle.date)}</span>
      ${currentArticle.tags && currentArticle.tags.length > 0 ? `
        <span class="article-tags">
          ${currentArticle.tags.map(tag => `<span class="article-tag">${escapeHtml(tag)}</span>`).join('')}
        </span>
      ` : ''}
    </div>
  `;
}

function updateTocOffset() {
  if (window.innerWidth <= 1024) {
    document.documentElement.style.setProperty('--toc-top', '12px');
    return;
  }

  document.documentElement.style.setProperty('--toc-top', '24px');
}

function showLoading() {
  if (articleHeadlineEl) {
    articleHeadlineEl.innerHTML = '';
  }
  articleContentEl.innerHTML = `
    <div class="loading-state">
      <p>加载中...</p>
    </div>
  `;
  if (articleCommentsHostEl) {
    articleCommentsHostEl.innerHTML = '';
  }
}

function showError(message) {
  if (articleHeadlineEl) {
    articleHeadlineEl.innerHTML = '';
  }
  articleContentEl.innerHTML = `
    <div class="error-state">
      <h3>出错了</h3>
      <p>${message}</p>
    </div>
  `;
  if (articleCommentsHostEl) {
    articleCommentsHostEl.innerHTML = '';
  }
}

function formatDate(dateString) {
  if (!dateString) return '未知日期';

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    return dateString;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function stripFrontMatter(markdown) {
  if (!markdown) return '';
  return markdown.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function ensureHighlightThemeLink() {
  let themeLink = document.getElementById('hljs-theme');
  if (!themeLink) {
    themeLink = document.createElement('link');
    themeLink.id = 'hljs-theme';
    themeLink.rel = 'stylesheet';
    document.head.appendChild(themeLink);
  }
  themeLink.href = getHighlightThemeHref();
}

function getHighlightThemeHref() {
  const mode = document.body.getAttribute('data-mode') === 'light' ? 'light' : 'dark';
  const styleName = mode === 'light' ? 'github' : 'github-dark';
  return `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/${styleName}.min.css`;
}

function enhanceArticleLinks(sourcePath) {
  const bodyEl = articleContentEl ? articleContentEl.querySelector('.article-body') : null;
  if (!bodyEl) return;

  const anchors = bodyEl.querySelectorAll('a[href]');
  anchors.forEach((anchor) => {
    const href = (anchor.getAttribute('href') || '').trim();
    if (!href) return;

    if (isExternalHttpLink(href)) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      return;
    }

    anchor.addEventListener('click', async (event) => {
      const rawHref = (anchor.getAttribute('href') || '').trim();
      if (!rawHref) return;

      if (rawHref.startsWith('#')) {
        event.preventDefault();
        scrollToLocalHash(rawHref);
        return;
      }

      event.preventDefault();
      const handled = await tryHandleInternalLink(rawHref, sourcePath);
      if (!handled) {
        window.location.href = rawHref;
      }
    });
  });
}

function isExternalHttpLink(href) {
  try {
    const url = new URL(href, window.location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin;
  } catch (error) {
    return false;
  }
}

function scrollToLocalHash(hashValue) {
  const decoded = decodeURIComponent(hashValue.replace(/^#/, '')).trim();
  if (!decoded) return;

  const byId = document.getElementById(decoded);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const bodyEl = articleContentEl ? articleContentEl.querySelector('.article-body') : null;
  if (!bodyEl) return;

  const headings = bodyEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
  for (const heading of headings) {
    const text = (heading.textContent || '').trim();
    if (text === decoded) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
}

async function tryHandleInternalLink(rawHref, sourcePath) {
  try {
    const url = new URL(rawHref, buildBaseUrl(sourcePath));
    if (url.origin !== window.location.origin) return false;

    if (url.pathname.endsWith('/article.html')) {
      const nextId = (url.searchParams.get('id') || '').trim();
      const nextDoc = (url.searchParams.get('doc') || '').trim();
      if (nextId) {
        await loadArticle(nextId);
        history.pushState(null, '', `./article.html?id=${encodeURIComponent(nextId)}`);
        return true;
      }
      if (nextDoc) {
        await loadDocumentByPath(nextDoc);
        history.pushState(null, '', `./article.html?doc=${encodeURIComponent(nextDoc)}`);
        return true;
      }
      return false;
    }

    const pathNoSlash = normalizeDocPath(url.pathname);
    if (!pathNoSlash || !/\.(md|html)$/i.test(pathNoSlash)) {
      return false;
    }

    const index = await fetchArticlesIndex();
    const matched = matchArticleByPath(index, pathNoSlash);
    if (matched) {
      await loadArticle(matched.id);
      history.pushState(null, '', `./article.html?id=${encodeURIComponent(matched.id)}`);
      return true;
    }

    const candidates = uniquePaths([pathNoSlash, (rawHref || '').replace(/^[./]+/, '')]);
    for (const candidate of candidates) {
      if (!candidate || !/\.(md|html)$/i.test(candidate)) continue;
      try {
        await loadDocumentByPath(candidate);
        history.pushState(null, '', `./article.html?doc=${encodeURIComponent(candidate)}`);
        return true;
      } catch (error) {
        // try next candidate
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function buildBaseUrl(sourcePath) {
  const normalized = normalizeDocPath(sourcePath || currentSourcePath || 'article.html');
  if (!normalized) return window.location.href;
  return new URL(normalized, window.location.origin + '/').toString();
}

function normalizeDocPath(pathValue) {
  if (!pathValue || typeof pathValue !== 'string') return '';
  return pathValue.replace(/^\/+/, '').trim();
}

function matchArticleByPath(index, pathNoSlash) {
  const normalizedPath = pathNoSlash.toLowerCase();
  const fileName = normalizedPath.split('/').pop();

  return index.find((item) => {
    const idPath = item && item.id ? `${item.id}`.toLowerCase() : '';
    const filePath = item && item.file ? `articles/${item.file}`.toLowerCase() : '';
    const itemFile = item && item.file ? `${item.file}`.toLowerCase() : '';
    return normalizedPath === filePath || normalizedPath === itemFile || normalizedPath === idPath || normalizedPath === `${idPath}.md` || normalizedPath === `${idPath}.html` || fileName === itemFile;
  }) || null;
}

function uniquePaths(paths) {
  const set = new Set();
  paths.forEach((item) => {
    const normalized = normalizeDocPath(item);
    if (normalized) set.add(normalized);
  });
  return Array.from(set);
}

function extractDocMeta(docPath, content) {
  const normalized = typeof content === 'string' ? content.replace(/^\uFEFF/, '') : '';
  const isMarkdown = /\.md$/i.test(docPath);
  const fileName = docPath.split('/').pop() || '文档';

  if (!isMarkdown) {
    return {
      title: extractHtmlTitle(normalized) || fileName,
      date: '',
      tags: []
    };
  }

  const frontMatter = parseFrontMatter(normalized);
  const titleFromBody = extractMarkdownTitle(stripFrontMatter(normalized));
  return {
    title: (frontMatter && frontMatter.title) || titleFromBody || fileName,
    date: (frontMatter && frontMatter.date) || '',
    tags: parseTags(frontMatter && frontMatter.tags)
  };
}

function extractMarkdownTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractHtmlTitle(content) {
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) continue;
    data[key.trim()] = rest.join(':').trim();
  }
  return data;
}

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((tag) => typeof tag === 'string');
  if (typeof raw !== 'string') return [];
  if (!raw.includes(',')) return [raw.trim()].filter(Boolean);
  return raw.split(',').map((tag) => tag.trim()).filter(Boolean);
}

