import { siteConfig } from '../../config/site-config.js';

export function addComments(containerEl) {
  if (!containerEl) return;

  if (document.querySelector('.giscus-container')) {
    return;
  }

  const commentsContainer = document.createElement('div');
  commentsContainer.className = 'giscus-container';
  containerEl.appendChild(commentsContainer);

  const { giscus } = siteConfig;
  if (!giscus || !giscus.repoId || !giscus.categoryId) {
    commentsContainer.innerHTML = `
      <div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 20px;">
        <p>评论功能暂未启用</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">如需启用评论，请先配置 Giscus</p>
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
      <div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 20px;">
        <p>评论功能加载失败</p>
      </div>
    `;
  };

  script.setAttribute('data-repo', giscus.repo);
  script.setAttribute('data-repo-id', giscus.repoId);
  script.setAttribute('data-category', giscus.category);
  script.setAttribute('data-category-id', giscus.categoryId);
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', 'dark');
  script.setAttribute('data-lang', 'zh-CN');

  commentsContainer.appendChild(script);
}
