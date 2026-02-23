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
}
