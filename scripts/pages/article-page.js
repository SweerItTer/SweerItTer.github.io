import { initArticle, loadArticle, loadDocumentByPath } from '../article.js';
import { initThemeSwitch } from '../ui/theme-switch.js';
import { fetchArticlesIndex } from '../features/articles-source.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

async function initPage() {
  const backBtn = document.getElementById('go-blog');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = './blog.html';
    });
  }

  initThemeSwitch({ enablePreviewTheme: true });
  initArticle();

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');
  const docPath = params.get('doc');

  if (docPath) {
    await loadDocumentByPath(docPath);
    return;
  }

  if (articleId) {
    await loadArticle(articleId);
    return;
  }

  try {
    const list = await fetchArticlesIndex();
    if (list.length > 0) {
      const firstId = list[0].id;
      history.replaceState(null, '', `./article.html?id=${encodeURIComponent(firstId)}`);
      await loadArticle(firstId);
      return;
    }
    renderNoArticle();
  } catch (error) {
    renderNoArticle();
  }
}

function renderNoArticle() {
  const content = document.getElementById('article-content');
  if (!content) return;
  content.innerHTML = `
    <div class="error-state">
      <h3>暂无文章</h3>
      <p>请先在 articles 目录中添加文章文件。</p>
    </div>
  `;
}
