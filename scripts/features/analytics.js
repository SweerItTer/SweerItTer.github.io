import { siteConfig } from '../../config/site-config.js';

let injected = false;

export function initAnalytics() {
  if (injected) return;
  if (!siteConfig.analytics || !siteConfig.analytics.enabled) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  document.body.appendChild(script);

  injected = true;
}

export function renderAnalytics(containerEl) {
  if (!containerEl) return;
  if (containerEl.querySelector('.article-stats')) return;

  const stats = document.createElement('div');
  stats.className = 'article-stats';
  stats.innerHTML = `
    <span>阅读量 <span id="busuanzi_value_page_pv">-</span></span>
    <span>访问人数 <span id="busuanzi_value_page_uv">-</span></span>
  `;

  const meta = containerEl.querySelector('.article-meta');
  if (meta && meta.nextSibling) {
    meta.parentNode.insertBefore(stats, meta.nextSibling);
  } else {
    containerEl.appendChild(stats);
  }

  lockValuesPerSession();
}

function lockValuesPerSession() {
  const pageKey = resolveAnalyticsPageKey();
  const pvKey = `pv:${pageKey}`;
  const uvKey = `uv:${pageKey}`;

  const pvEl = document.getElementById('busuanzi_value_page_pv');
  const uvEl = document.getElementById('busuanzi_value_page_uv');
  if (!pvEl || !uvEl) return;

  const cachedPv = sessionStorage.getItem(pvKey);
  const cachedUv = sessionStorage.getItem(uvKey);

  if (cachedPv && cachedUv) {
    applyLockedValues(pvEl, uvEl, cachedPv, cachedUv);
    return;
  }

  const observer = new MutationObserver(() => {
    const currentPv = pvEl.textContent || '';
    const currentUv = uvEl.textContent || '';

    if (isValidNumber(currentPv) && isValidNumber(currentUv)) {
      sessionStorage.setItem(pvKey, currentPv);
      sessionStorage.setItem(uvKey, currentUv);
      observer.disconnect();
    }
  });

  observer.observe(pvEl, { childList: true, subtree: true });
  observer.observe(uvEl, { childList: true, subtree: true });
}

function resolveAnalyticsPageKey() {
  const params = new URLSearchParams(window.location.search);
  const articleId = (params.get('id') || '').trim();
  if (articleId) {
    return `article:${articleId}`;
  }
  return `path:${window.location.pathname}`;
}

function applyLockedValues(pvEl, uvEl, pvValue, uvValue) {
  pvEl.textContent = pvValue;
  uvEl.textContent = uvValue;

  const restore = () => {
    pvEl.textContent = pvValue;
    uvEl.textContent = uvValue;
  };

  const observer = new MutationObserver(() => {
    restore();
  });

  observer.observe(pvEl, { childList: true, subtree: true });
  observer.observe(uvEl, { childList: true, subtree: true });
}

function isValidNumber(value) {
  return value !== '-' && value !== '' && !Number.isNaN(Number(value));
}
