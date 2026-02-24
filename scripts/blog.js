// ============================================
// 博客列表管理
// ============================================

import { fetchArticlesIndex } from './features/articles-source.js';

let initialized = false;
let articles = [];
let currentSort = 'alpha';
let searchQuery = '';

let articlesListEl = null;
let searchInputEl = null;
let sortButtonsEl = null;

export function initBlog() {
  if (initialized) return;

  articlesListEl = document.getElementById('articles-list');
  searchInputEl = document.getElementById('search-input');
  sortButtonsEl = document.querySelectorAll('.sort-btn');

  if (!articlesListEl) {
    console.error('Articles list element not found');
    return;
  }

  initEventListeners();
  loadArticles();
  initialized = true;
}

export function loadBlog() {
  if (!initialized) {
    initBlog();
    return;
  }
  renderArticles();
}

export function getArticlesCache() {
  return articles;
}

function initEventListeners() {
  if (searchInputEl) {
    let debounceTimer;
    searchInputEl.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderArticles();
      }, 300);
    });
  }

  sortButtonsEl.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sortType = btn.dataset.sort;
      if (sortType && sortType !== currentSort) {
        currentSort = sortType;
        sortButtonsEl.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderArticles();
      }
    });
  });
}

async function loadArticles() {
  try {
    articles = await fetchArticlesIndex();
    renderArticles();
  } catch (error) {
    console.error('Error loading articles:', error);
    const message = String(error && error.message ? error.message : '');
    if (message.includes('(403)')) {
      showError('GitHub API 访问频率受限（403），请稍后重试');
      return;
    }
    showError('加载文章列表失败，请稍后重试');
  }
}

function renderArticles() {
  if (!articlesListEl) return;

  let filteredArticles = filterArticles(articles, searchQuery);
  filteredArticles = sortArticles(filteredArticles, currentSort);

  articlesListEl.innerHTML = '';

  if (filteredArticles.length === 0) {
    showEmptyState(searchQuery ? '没有找到匹配的文章' : '暂无文章');
    return;
  }

  filteredArticles.forEach((article) => {
    const card = createArticleCard(article);
    articlesListEl.appendChild(card);
  });
}

function filterArticles(articlesList, query) {
  if (!query) return articlesList;

  return articlesList.filter((article) => {
    const title = article.title ? article.title.toLowerCase() : '';
    const description = article.description ? article.description.toLowerCase() : '';
    const tags = article.tags ? article.tags.join(' ').toLowerCase() : '';

    return (
      title.includes(query) ||
      description.includes(query) ||
      tags.includes(query)
    );
  });
}

function sortArticles(articlesList, sortType) {
  const sorted = [...articlesList];

  if (sortType === 'alpha') {
    sorted.sort((a, b) => {
      const titleA = a.title ? a.title.toLowerCase() : '';
      const titleB = b.title ? b.title.toLowerCase() : '';
      return titleA.localeCompare(titleB, 'zh-CN');
    });
  } else if (sortType === 'date') {
    sorted.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  }

  return sorted;
}

function createArticleCard(article) {
  const card = document.createElement('div');
  card.className = 'article-card';
  card.setAttribute('data-id', article.id);

  card.addEventListener('click', () => {
    window.location.href = `./article.html?id=${encodeURIComponent(article.id)}`;
  });

  const tagsHtml = article.tags && article.tags.length > 0
    ? `<div class="article-card-tags">
        ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
       </div>`
    : '';

  card.innerHTML = `
    <h3 class="article-card-title">${escapeHtml(article.title || '无标题')}</h3>
    <div class="article-card-date">${formatDate(article.date)}</div>
    <p class="article-card-description">${escapeHtml(article.description || '暂无描述')}</p>
    ${tagsHtml}
  `;

  return card;
}

function showEmptyState(message) {
  if (!articlesListEl) return;

  articlesListEl.innerHTML = `
    <div class="empty-state">
      <h3>暂无内容</h3>
      <p>${message}</p>
    </div>
  `;
}

function showError(message) {
  if (!articlesListEl) return;

  articlesListEl.innerHTML = `
    <div class="empty-state">
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
