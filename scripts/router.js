// ============================================
// 路由管理器 - 基于 Hash 的单页应用路由
// ============================================

(function() {
    'use strict';

    // 路由配置
    const routes = {
        '': 'welcome',
        'blog': 'blog',
        'article': 'article'
    };

    // 页面容器
    const containers = {
        welcome: null,
        blog: null,
        article: null
    };

    // 当前路由
    let currentRoute = 'welcome';

    // 路由切换前的回调
    let beforeRouteChange = null;
    // 路由切换后的回调
    let afterRouteChange = null;

    // ============================================
    // 初始化路由器
    // ============================================
    function initRouter() {
        // 获取页面容器
        containers.welcome = document.getElementById('welcome-container');
        containers.blog = document.getElementById('blog-container');
        containers.article = document.getElementById('article-container');

        // 监听 hash 变化
        window.addEventListener('hashchange', handleHashChange);

        // 处理初始路由
        handleHashChange();
    }

    // ============================================
    // 处理 Hash 变化
    // ============================================
    function handleHashChange() {
        const hash = window.location.hash.slice(1); // 移除 #
        const parsedRoute = parseRoute(hash);
        const newRoute = parsedRoute.page;
        const params = parsedRoute.params;

        // 如果路由相同，不处理
        if (newRoute === currentRoute && hash === '') return;

        // 调用路由切换前的回调
        if (beforeRouteChange) {
            const shouldContinue = beforeRouteChange(currentRoute, newRoute, params);
            if (shouldContinue === false) return;
        }

        // 切换页面
        switchPage(currentRoute, newRoute, params);

        // 更新当前路由
        const previousRoute = currentRoute;
        currentRoute = newRoute;

        // 调用路由切换后的回调
        if (afterRouteChange) {
            afterRouteChange(previousRoute, newRoute, params);
        }
    }

    // ============================================
    // 解析路由
    // ============================================
    function parseRoute(hash) {
        if (!hash) {
            return { page: 'welcome', params: {} };
        }

        // 博客页面
        if (hash === 'blog') {
            return { page: 'blog', params: {} };
        }

        // 文章页面
        const articleMatch = hash.match(/^article\/(.+)$/);
        if (articleMatch) {
            return { page: 'article', params: { id: articleMatch[1] } };
        }

        // 默认返回欢迎页
        return { page: 'welcome', params: {} };
    }

    // ============================================
    // 切换页面
    // ============================================
    function switchPage(fromPage, toPage, params) {
        // 隐藏当前页面
        if (containers[fromPage]) {
            containers[fromPage].classList.remove('active');
            containers[fromPage].classList.add('hidden');
        }

        // 显示目标页面
        if (containers[toPage]) {
            containers[toPage].classList.remove('hidden');
            containers[toPage].classList.add('active');

            // 滚动到顶部
            window.scrollTo(0, 0);
        }

        // 如果切换到文章页面，触发文章加载
        if (toPage === 'article' && params.id && window.loadArticle) {
            window.loadArticle(params.id);
        }

        // 如果切换到博客页面，触发博客列表加载
        if (toPage === 'blog' && window.loadBlog) {
            window.loadBlog();
        }
    }

    // ============================================
    // 导航到指定路由
    // ============================================
    function navigate(path) {
        if (path === '' || path === 'welcome') {
            window.location.hash = '';
        } else {
            window.location.hash = path;
        }
    }

    // ============================================
    // 设置路由切换前的回调
    // ============================================
    function setBeforeRouteChange(callback) {
        beforeRouteChange = callback;
    }

    // ============================================
    // 设置路由切换后的回调
    // ============================================
    function setAfterRouteChange(callback) {
        afterRouteChange = callback;
    }

    // ============================================
    // 获取当前路由
    // ============================================
    function getCurrentRoute() {
        return currentRoute;
    }

    // ============================================
    // 暴露公共 API
    // ============================================
    window.Router = {
        init: initRouter,
        navigate: navigate,
        setBeforeRouteChange: setBeforeRouteChange,
        setAfterRouteChange: setAfterRouteChange,
        getCurrentRoute: getCurrentRoute
    };

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
    } else {
        initRouter();
    }
})();