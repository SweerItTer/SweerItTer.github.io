import { siteConfig } from '../../config/site-config.js';
import { getCurrentAppearance, getGiscusThemeForMode } from '../ui/theme-switch.js';

let giscusThemeBound = false;

export function addComments(containerEl) {
  if (!containerEl) return;

  if (document.querySelector('.giscus-container')) {
    return;
  }

  const section = document.createElement('div');
  section.className = 'comments-section';

  const header = document.createElement('div');
  header.className = 'comments-header';
  header.textContent = '评论';

  const hint = document.createElement('div');
  hint.className = 'comments-hint';
  hint.textContent = '使用 GitHub 登录后可评论，点赞通过 reactions 完成。';

  const commentsContainer = document.createElement('div');
  commentsContainer.className = 'giscus-container';

  section.appendChild(header);
  section.appendChild(hint);
  section.appendChild(commentsContainer);
  containerEl.appendChild(section);

  const { giscus } = siteConfig;
  if (!giscus || !giscus.repoId || !giscus.categoryId) {
    commentsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-soft); padding: 20px;">
        <p>评论功能暂未启用</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">请在 config/site-config.js 中配置 Giscus 参数</p>
      </div>
    `;
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onerror = () => {
    commentsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-soft); padding: 20px;">
        <p>评论功能加载失败</p>
      </div>
    `;
  };

  script.setAttribute('data-repo', giscus.repo);
  script.setAttribute('data-repo-id', giscus.repoId);
  script.setAttribute('data-category', giscus.category);
  script.setAttribute('data-category-id', giscus.categoryId);
  script.setAttribute('data-mapping', 'specific');
  script.setAttribute('data-term', resolveDiscussionTerm());
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', getGiscusThemeForMode(getCurrentAppearance().mode));
  script.setAttribute('data-lang', 'zh-CN');

  commentsContainer.appendChild(script);
  bindGiscusTheme();
}

function resolveDiscussionTerm() {
  const params = new URLSearchParams(window.location.search);
  const articleId = (params.get('id') || '').trim();
  if (articleId) {
    return `article:${articleId}`;
  }
  return `path:${window.location.pathname}`;
}

function bindGiscusTheme() {
  if (giscusThemeBound) return;
  giscusThemeBound = true;

  window.addEventListener('appearancechange', (event) => {
    const mode = event.detail && event.detail.mode === 'light' ? 'light' : 'dark';
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: getGiscusThemeForMode(mode) } } },
      'https://giscus.app'
    );
  });
}
