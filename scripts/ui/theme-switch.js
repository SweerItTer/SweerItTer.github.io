import { siteConfig } from '../../config/site-config.js';
import { appState } from '../core/state.js';

const STORAGE_KEY = 'blog-theme';

export function initThemeSwitch(selectEl) {
  if (!selectEl) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = saved || siteConfig.defaultTheme || 'github';
  applyTheme(theme);
  selectEl.value = theme;

  selectEl.addEventListener('change', () => {
    const next = selectEl.value;
    applyTheme(next);
  });
}

export function applyTheme(theme) {
  const safeTheme = theme === 'claude' ? 'claude' : 'github';
  document.body.setAttribute('data-theme', safeTheme);
  localStorage.setItem(STORAGE_KEY, safeTheme);
  appState.theme = safeTheme;
}
