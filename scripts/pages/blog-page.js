import { initBlog } from '../blog.js';
import { initThemeSwitch } from '../ui/theme-switch.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

function initPage() {
  initThemeSwitch({ enablePreviewTheme: false });

  const backBtn = document.getElementById('go-welcome');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = './welcome_page.html';
    });
  }

  initBlog();
}
