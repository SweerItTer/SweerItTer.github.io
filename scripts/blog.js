// ============================================
// 博客列表管理
// ============================================

(function() {
    'use strict';

    // 文章数据
    let articles = [];
    let currentSort = 'alpha'; // 'alpha' 或 'date'
    let searchQuery = '';

    // DOM 元素
    let articlesListEl = null;
    let searchInputEl = null;
    let sortButtonsEl = null;

    // ============================================
    // 初始化博客列表
    // ============================================
    function initBlog() {
        // 获取 DOM 元素
        articlesListEl = document.getElementById('articles-list');
        searchInputEl = document.getElementById('search-input');
        sortButtonsEl = document.querySelectorAll('.sort-btn');

        if (!articlesListEl) {
            console.error('Articles list element not found');
            return;
        }

        // 初始化事件监听器
        initEventListeners();

        // 加载文章列表
        loadArticles();
    }

    // ============================================
    // 初始化事件监听器
    // ============================================
    function initEventListeners() {
        // 搜索输入（带防抖）
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

        // 排序按钮
        sortButtonsEl.forEach((btn) => {
            btn.addEventListener('click', () => {
                const sortType = btn.dataset.sort;
                if (sortType && sortType !== currentSort) {
                    currentSort = sortType;

                    // 更新按钮状态
                    sortButtonsEl.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // 重新渲染
                    renderArticles();
                }
            });
        });
    }

    // ============================================
    // 加载文章列表
    // ============================================
    async function loadArticles() {
        try {
            const response = await fetch('articles/articles.json');
            if (!response.ok) {
                throw new Error('Failed to load articles.json');
            }

            const data = await response.json();
            articles = data.articles || [];

            // 渲染文章列表
            renderArticles();
        } catch (error) {
            console.error('Error loading articles:', error);
            showError('加载文章列表失败，请稍后重试');
        }
    }

    // ============================================
    // 渲染文章列表
    // ============================================
    function renderArticles() {
        if (!articlesListEl) return;

        // 过滤文章
        let filteredArticles = filterArticles(articles, searchQuery);

        // 排序文章
        filteredArticles = sortArticles(filteredArticles, currentSort);

        // 清空列表
        articlesListEl.innerHTML = '';

        // 显示空状态或文章列表
        if (filteredArticles.length === 0) {
            showEmptyState(searchQuery ? '没有找到匹配的文章' : '暂无文章');
            return;
        }

        // 渲染文章卡片
        filteredArticles.forEach((article) => {
            const card = createArticleCard(article);
            articlesListEl.appendChild(card);
        });
    }

    // ============================================
    // 过滤文章（模糊搜索）
    // ============================================
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

    // ============================================
    // 排序文章
    // ============================================
    function sortArticles(articlesList, sortType) {
        const sorted = [...articlesList];

        if (sortType === 'alpha') {
            // 按字母排序（标题）
            sorted.sort((a, b) => {
                const titleA = a.title ? a.title.toLowerCase() : '';
                const titleB = b.title ? b.title.toLowerCase() : '';
                return titleA.localeCompare(titleB, 'zh-CN');
            });
        } else if (sortType === 'date') {
            // 按时间排序（最新的在前）
            sorted.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB - dateA;
            });
        }

        return sorted;
    }

    // ============================================
    // 创建文章卡片
    // ============================================
    function createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.setAttribute('data-id', article.id);

        // 点击卡片跳转到文章页
        card.addEventListener('click', () => {
            if (window.Router && window.Router.navigate) {
                window.Router.navigate(`article/${article.id}`);
            }
        });

        // 卡片内容
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

    // ============================================
    // 显示空状态
    // ============================================
    function showEmptyState(message) {
        if (!articlesListEl) return;

        articlesListEl.innerHTML = `
            <div class="empty-state">
                <h3>暂无内容</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // ============================================
    // 显示错误信息
    // ============================================
    function showError(message) {
        if (!articlesListEl) return;

        articlesListEl.innerHTML = `
            <div class="empty-state">
                <h3>出错了</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // ============================================
    // 格式化日期
    // ============================================
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

    // ============================================
    // HTML 转义（防止 XSS）
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // 暴露公共 API
    // ============================================
    window.loadBlog = initBlog;

    // 如果路由器已经加载，自动初始化
    if (window.Router && window.Router.getCurrentRoute() === 'blog') {
        initBlog();
    }
})();