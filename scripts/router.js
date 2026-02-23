// ============================================
// 路由管理器 - 基于 Hash 的单页应用路由
// ============================================

'use strict';

const routes = {
  '': 'welcome',
  blog: 'blog',
  article: 'article'
};

const containers = {
  welcome: null,
  blog: null,
  article: null
};

let currentRoute = 'welcome';
let beforeRouteChange = null;
let afterRouteChange = null;
let routeHandlers = { blog: null, article: null };

export function initRouter(handlers = {}) {
  routeHandlers = { ...routeHandlers, ...handlers };

  containers.welcome = document.getElementById('welcome-container');
  containers.blog = document.getElementById('blog-container');
  containers.article = document.getElementById('article-container');

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  const parsedRoute = parseRoute(hash);
  const newRoute = parsedRoute.page;
  const params = parsedRoute.params;

  if (newRoute === currentRoute && hash === '') return;

  if (beforeRouteChange) {
    const shouldContinue = beforeRouteChange(currentRoute, newRoute, params);
    if (shouldContinue === false) return;
  }

  switchPage(currentRoute, newRoute, params);

  const previousRoute = currentRoute;
  currentRoute = newRoute;

  if (afterRouteChange) {
    afterRouteChange(previousRoute, newRoute, params);
  }
}

function parseRoute(hash) {
  if (!hash) {
    return { page: 'welcome', params: {} };
  }

  if (hash === 'blog') {
    return { page: 'blog', params: {} };
  }

  const articleMatch = hash.match(/^article\/(.+)$/);
  if (articleMatch) {
    return { page: 'article', params: { id: articleMatch[1] } };
  }

  return { page: 'welcome', params: {} };
}

function switchPage(fromPage, toPage, params) {
  if (containers[fromPage]) {
    containers[fromPage].classList.remove('active');
    containers[fromPage].classList.add('hidden');
  }

  if (containers[toPage]) {
    containers[toPage].classList.remove('hidden');
    containers[toPage].classList.add('active');
    window.scrollTo(0, 0);
  }

  if (toPage === 'article' && params.id && routeHandlers.article) {
    routeHandlers.article(params.id);
  }

  if (toPage === 'blog' && routeHandlers.blog) {
    routeHandlers.blog();
  }
}

export function navigate(path) {
  if (path === '' || path === 'welcome') {
    window.location.hash = '';
  } else {
    window.location.hash = path;
  }
}

export function setBeforeRouteChange(callback) {
  beforeRouteChange = callback;
}

export function setAfterRouteChange(callback) {
  afterRouteChange = callback;
}

export function getCurrentRoute() {
  return currentRoute;
}
