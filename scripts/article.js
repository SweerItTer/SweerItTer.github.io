// ============================================
// 文章渲染管理
// ============================================

(function() {
    'use strict';

    // 当前文章 ID
    let currentArticleId = null;
    let currentArticle = null;

    // DOM 元素
    let articleContentEl = null;

    // ============================================
    // 初始化文章页面
    // ============================================
    function initArticle() {
        articleContentEl = document.getElementById('article-content');

        if (!articleContentEl) {
            console.error('Article content element not found');
            return;
        }

        // 初始化 Markdown 解析器和代码高亮
        initMarkdownParser();
        initCodeHighlight();

        // 加载目录导航样式
        initTOCStyles();
    }

    // ============================================
    // 加载文章
    // ============================================
    async function loadArticle(articleId) {
        currentArticleId = articleId;

        // 显示加载状态
        showLoading();

        try {
            // 获取文章列表以找到对应的文件
            const response = await fetch('articles/articles.json');
            if (!response.ok) {
                throw new Error('Failed to load articles.json');
            }

            const data = await response.json();
            const article = data.articles.find(a => a.id === articleId);

            if (!article) {
                showError('文章不存在');
                return;
            }

            currentArticle = article;

            // 加载文章文件
            await loadArticleFile(article.file);

        } catch (error) {
            console.error('Error loading article:', error);
            showError('加载文章失败，请稍后重试');
        }
    }

    // ============================================
    // 加载文章文件
    // ============================================
    async function loadArticleFile(filename) {
        try {
            const response = await fetch(`articles/${filename}`);

            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }

            const content = await response.text();
            const fileExtension = filename.split('.').pop().toLowerCase();

            // 根据文件类型渲染内容
            if (fileExtension === 'md') {
                renderMarkdown(content);
            } else if (fileExtension === 'html') {
                renderHTML(content);
            } else {
                // 默认当作 HTML 处理
                renderHTML(content);
            }

            // 生成目录导航
            generateTOC();

            // 添加评论系统
            addComments();

        } catch (error) {
            console.error('Error loading article file:', error);
            showError('加载文章内容失败');
        }
    }

    // ============================================
    // 初始化 Markdown 解析器
    // ============================================
    function initMarkdownParser() {
        // 如果 marked.js 未加载，动态加载
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

    // ============================================
    // 初始化代码高亮
    // ============================================
    function initCodeHighlight() {
        // 如果 highlight.js 未加载，动态加载
        if (typeof hljs === 'undefined') {
            // 加载核心库
            const coreScript = document.createElement('script');
            coreScript.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/core.min.js';
            coreScript.async = true;
            document.head.appendChild(coreScript);

            // 加载常用语言支持
            const languages = ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'bash', 'sql', 'typescript'];
            languages.forEach(lang => {
                const langScript = document.createElement('script');
                langScript.src = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/languages/${lang}.min.js`;
                langScript.async = true;
                document.head.appendChild(langScript);
            });

            // 加载样式
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';
            document.head.appendChild(styleLink);

            console.log('Highlight.js loaded successfully');
        }
    }

    // ============================================
    // 渲染 Markdown 内容
    // ============================================
    function renderMarkdown(content) {
        if (typeof marked === 'undefined') {
            // 等待 marked.js 加载
            setTimeout(() => {
                if (typeof marked !== 'undefined') {
                    renderMarkdown(content);
                } else {
                    showError('Markdown 解析器加载失败');
                }
            }, 100);
            return;
        }

        // 配置 marked
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

        // 渲染 Markdown
        const html = marked.parse(content);

        // 显示文章内容
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
    }

    // ============================================
    // 渲染 HTML 内容
    // ============================================
    function renderHTML(content) {
        // 显示文章内容
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

        // 应用代码高亮
        if (typeof hljs !== 'undefined') {
            articleContentEl.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    // ============================================
    // 生成目录导航
    // ============================================
    function generateTOC() {
        // 获取文章内容中的标题
        const headings = articleContentEl.querySelectorAll('h2, h3');

        if (headings.length === 0) return;

        // 创建目录容器
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';

        const tocTitle = document.createElement('div');
        tocTitle.className = 'toc-title';
        tocTitle.textContent = '目录';
        tocContainer.appendChild(tocTitle);

        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        tocContainer.appendChild(tocList);

        // 生成目录项
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;

            const tocItem = document.createElement('li');
            tocItem.className = `toc-item toc-level-${heading.tagName.toLowerCase()}`;

            const tocLink = document.createElement('a');
            tocLink.href = `#${id}`;
            tocLink.textContent = heading.textContent;
            tocLink.className = 'toc-link';

            tocItem.appendChild(tocLink);
            tocList.appendChild(tocItem);

            // 点击目录项滚动到对应位置
            tocLink.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // 将目录插入到文章内容前
        articleContentEl.insertBefore(tocContainer, articleContentEl.firstChild.nextSibling);

        // 添加滚动监听，高亮当前目录项
        initTOCScrollSpy();
    }

    // ============================================
    // 初始化目录滚动监听
    // ============================================
    function initTOCScrollSpy() {
        const headings = articleContentEl.querySelectorAll('h2, h3');
        const tocLinks = articleContentEl.querySelectorAll('.toc-link');

        if (headings.length === 0 || tocLinks.length === 0) return;

        const observerOptions = {
            rootMargin: '-100px 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        headings.forEach(heading => observer.observe(heading));
    }

    // ============================================
    // 初始化目录样式
    // ============================================
    function initTOCStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toc-container {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
            }

            .toc-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #fff;
                margin-bottom: 16px;
            }

            .toc-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .toc-item {
                margin-bottom: 8px;
            }

            .toc-level-h3 {
                padding-left: 20px;
            }

            .toc-link {
                display: block;
                color: rgba(255, 255, 255, 0.7);
                text-decoration: none;
                padding: 6px 12px;
                border-radius: 6px;
                transition: all 0.3s ease;
                font-size: 0.95rem;
            }

            .toc-link:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.08);
            }

            .toc-link.active {
                color: #fff;
                background: rgba(102, 126, 234, 0.2);
                border-left: 3px solid #667eea;
            }

            .article-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                margin: 20px 0 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .article-date {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.9rem;
            }

            .article-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .article-body {
                line-height: 1.8;
            }

            .article-body h2,
            .article-body h3 {
                margin-top: 2em;
                margin-bottom: 1em;
                color: #fff;
            }

            .article-body h2 {
                font-size: 2rem;
            }

            .article-body h3 {
                font-size: 1.5rem;
            }

            .article-body p {
                margin-bottom: 1.5em;
            }

            .article-body a {
                color: #667eea;
                text-decoration: none;
                transition: color 0.3s ease;
            }

            .article-body a:hover {
                color: #f093fb;
            }

            .article-body pre {
                background: rgba(0, 0, 0, 0.3);
                padding: 20px;
                border-radius: 8px;
                overflow-x: auto;
                margin-bottom: 1.5em;
            }

            .article-body code {
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.9em;
            }

            .article-body pre code {
                background: none;
            }

            .article-body blockquote {
                border-left: 4px solid #667eea;
                padding-left: 20px;
                margin: 1.5em 0;
                color: rgba(255, 255, 255, 0.7);
                font-style: italic;
            }

            /* Giscus 评论容器 */
            .giscus-container {
                margin-top: 40px;
                padding-top: 40px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // 添加评论系统
    // ============================================
    function addComments() {
        // 检查是否已经有 Giscus 脚本
        if (document.querySelector('.giscus-container')) {
            return;
        }

        // 创建评论容器
        const commentsContainer = document.createElement('div');
        commentsContainer.className = 'giscus-container';
        articleContentEl.appendChild(commentsContainer);

        // 动态加载 Giscus
        // 注意：用户需要先配置 Giscus 并获取 data-repo 等参数
        // 这里提供一个基本的示例，用户需要替换为自己的配置
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';

        // Giscus 配置 - 用户需要根据实际情况修改
        script.setAttribute('data-repo', 'SweerItTer/SweerItTer.github.io'); // 替换为你的仓库
        script.setAttribute('data-repo-id', ''); // 从 Giscus 获取
        script.setAttribute('data-category', 'Announcements'); // 替换为你的分类
        script.setAttribute('data-category-id', ''); // 从 Giscus 获取
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'dark');
        script.setAttribute('data-lang', 'zh-CN');

        commentsContainer.appendChild(script);
    }

    // ============================================
    // 显示加载状态
    // ============================================
    function showLoading() {
        articleContentEl.innerHTML = `
            <div class="loading-state">
                <p>加载中...</p>
            </div>
        `;
    }

    // ============================================
    // 显示错误信息
    // ============================================
    function showError(message) {
        articleContentEl.innerHTML = `
            <div class="error-state">
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
    window.loadArticle = loadArticle;

    // 初始化文章模块
    initArticle();
})();