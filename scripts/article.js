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

export function initArticle() {
  if (initialized) return;

  articleContentEl = document.getElementById('article-content');

  if (!articleContentEl) {
    console.error('Article content element not found');
    return;
  }

  initMarkdownParser();
  initCodeHighlight();

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
    const response = await fetch(`articles/${filename}`);

    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }

    const content = await response.text();
    const fileExtension = filename.split('.').pop().toLowerCase();

    if (fileExtension === 'md') {
      renderMarkdown(content);
    } else if (fileExtension === 'html') {
      renderHTML(content);
    } else {
      renderHTML(content);
    }

  } catch (error) {
    console.error('Error loading article file:', error);
    showError('加载文章内容失败');
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
  if (typeof hljs === 'undefined') {
    const bundleScript = document.createElement('script');
    bundleScript.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/highlight.min.js';
    bundleScript.async = true;
    document.head.appendChild(bundleScript);

    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';
    document.head.appendChild(styleLink);

    console.log('Highlight.js loaded successfully');
  }
}

function renderMarkdown(content) {
  if (typeof marked === 'undefined') {
    setTimeout(() => {
      if (typeof marked !== 'undefined') {
        renderMarkdown(content);
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

  const html = marked.parse(content);

  articleContentEl.innerHTML = `
    <h1>${escapeHtml(currentArticle.title)}</h1>
    <div class="article-meta">
      <span class="article-date">${formatDate(currentArticle.date)}</span>
      ${currentArticle.tags && currentArticle.tags.length > 0 ? `
        <span class="article-tags">
          ${currentArticle.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
        </span>
      ` : ''}
    </div>
    <div class="article-body">${html}</div>
  `;

  buildTOC(articleContentEl);
  renderAnalytics(articleContentEl);
  addComments(articleContentEl);
  initAnalytics();
  updateTocOffset();
}

function renderHTML(content) {
  articleContentEl.innerHTML = `
    <h1>${escapeHtml(currentArticle.title)}</h1>
    <div class="article-meta">
      <span class="article-date">${formatDate(currentArticle.date)}</span>
      ${currentArticle.tags && currentArticle.tags.length > 0 ? `
        <span class="article-tags">
          ${currentArticle.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
        </span>
      ` : ''}
    </div>
    <div class="article-body">${content}</div>
  `;

  if (typeof hljs !== 'undefined') {
    articleContentEl.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  buildTOC(articleContentEl);
  renderAnalytics(articleContentEl);
  addComments(articleContentEl);
  initAnalytics();
  updateTocOffset();
}

function updateTocOffset() {
  const header = document.querySelector('.article-header');
  if (!header) return;
  const rect = header.getBoundingClientRect();
  const top = Math.max(24, Math.round(rect.bottom + 12));
  document.documentElement.style.setProperty('--toc-top', `${top}px`);
}

function showLoading() {
  articleContentEl.innerHTML = `
    <div class="loading-state">
      <p>加载中...</p>
    </div>
  `;
}

function showError(message) {
  articleContentEl.innerHTML = `
    <div class="error-state">
      <h3>出错了</h3>
      <p>${message}</p>
    </div>
  `;
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
