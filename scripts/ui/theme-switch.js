import { siteConfig } from '../../config/site-config.js';
import { appState } from '../core/state.js';

const STORAGE_KEY = 'blog-theme';

export function initThemeSwitch(containerEl) {
  if (!containerEl) return;

  const trigger = containerEl.querySelector('.theme-trigger');
  const menu = containerEl.querySelector('.theme-menu');
  if (!trigger || !menu) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = saved || siteConfig.defaultTheme || 'github';
  applyTheme(theme);
  updateTriggerLabel(trigger, theme);

  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
  });

  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[data-theme-value]');
    if (!item) return;

    const next = item.getAttribute('data-theme-value');
    applyTheme(next);
    updateTriggerLabel(trigger, next);
    menu.hidden = true;
  });

  document.addEventListener('click', (event) => {
    if (!containerEl.contains(event.target)) {
      menu.hidden = true;
    }
  });
}

export function applyTheme(theme) {
  const safeTheme = theme === 'claude' ? 'claude' : 'github';
  document.body.setAttribute('data-theme', safeTheme);
  localStorage.setItem(STORAGE_KEY, safeTheme);
  appState.theme = safeTheme;
}

function updateTriggerLabel(trigger, theme) {
  trigger.textContent = theme === 'claude' ? 'Claude' : 'GitHub';
}
