import { siteConfig } from '../../config/site-config.js';
import { appState } from '../core/state.js';

const PREVIEW_THEME_KEY = 'blog-preview-theme:v1';
const APPEARANCE_KEY = 'blog-appearance:v3';
const SETTINGS_ROOT_ID = 'global-settings-root';

const PALETTES = {
  light: [
    {
      id: 'light-water-lily',
      name: '睡莲晨光',
      accent: '#6f8fbc',
      siteBg: '#c4ccd8',
      panelBg: 'rgba(228, 234, 242, 0.9)',
      panelBorder: 'rgba(87, 105, 131, 0.34)',
      tocBg: 'rgba(222, 230, 241, 0.92)',
      textStrong: '#1d2c3d',
      textSoft: 'rgba(40, 56, 78, 0.8)',
      borderSoft: 'rgba(82, 103, 132, 0.28)',
      borderStrong: 'rgba(72, 95, 124, 0.42)',
      surfaceHover: 'rgba(111, 143, 188, 0.14)',
      surfaceActive: 'rgba(111, 143, 188, 0.24)',
      selectBg: '#e8eef5',
      selectText: '#22364c',
      selectBorder: 'rgba(95, 119, 151, 0.42)'
    },
    {
      id: 'light-haystack',
      name: '干草暖阳',
      accent: '#bd8650',
      siteBg: '#d0c6b6',
      panelBg: 'rgba(238, 229, 215, 0.9)',
      panelBorder: 'rgba(130, 100, 69, 0.34)',
      tocBg: 'rgba(234, 224, 209, 0.93)',
      textStrong: '#39271a',
      textSoft: 'rgba(70, 51, 35, 0.8)',
      borderSoft: 'rgba(122, 95, 66, 0.28)',
      borderStrong: 'rgba(110, 83, 55, 0.42)',
      surfaceHover: 'rgba(189, 134, 80, 0.14)',
      surfaceActive: 'rgba(189, 134, 80, 0.24)',
      selectBg: '#efe5d7',
      selectText: '#3f2d1f',
      selectBorder: 'rgba(132, 102, 71, 0.42)'
    },
    {
      id: 'light-rose-mist',
      name: '玫瑰薄雾',
      accent: '#ad6e87',
      siteBg: '#cdc2ca',
      panelBg: 'rgba(238, 229, 236, 0.9)',
      panelBorder: 'rgba(124, 88, 105, 0.34)',
      tocBg: 'rgba(234, 223, 232, 0.93)',
      textStrong: '#3f2634',
      textSoft: 'rgba(77, 49, 63, 0.8)',
      borderSoft: 'rgba(116, 82, 98, 0.28)',
      borderStrong: 'rgba(105, 71, 88, 0.42)',
      surfaceHover: 'rgba(173, 110, 135, 0.14)',
      surfaceActive: 'rgba(173, 110, 135, 0.24)',
      selectBg: '#f0e4eb',
      selectText: '#4a2d3b',
      selectBorder: 'rgba(123, 87, 104, 0.42)'
    }
  ],
  dark: [
    {
      id: 'dark-giverny-night',
      name: '吉维尼夜色',
      accent: '#7a95cf',
      siteBg: '#07080c',
      panelBg: 'rgba(255, 255, 255, 0.03)',
      panelBorder: 'rgba(255, 255, 255, 0.12)',
      tocBg: 'rgba(255, 255, 255, 0.03)',
      textStrong: 'rgba(255, 255, 255, 0.93)',
      textSoft: 'rgba(255, 255, 255, 0.72)',
      borderSoft: 'rgba(255, 255, 255, 0.12)',
      borderStrong: 'rgba(255, 255, 255, 0.2)',
      surfaceHover: 'rgba(255, 255, 255, 0.08)',
      surfaceActive: 'rgba(122, 149, 207, 0.24)',
      selectBg: 'rgba(255, 255, 255, 0.05)',
      selectText: 'rgba(255, 255, 255, 0.9)',
      selectBorder: 'rgba(255, 255, 255, 0.2)'
    },
    {
      id: 'dark-twilight-river',
      name: '暮河紫蓝',
      accent: '#9b8ad3',
      siteBg: '#0d0b15',
      panelBg: 'rgba(255, 255, 255, 0.035)',
      panelBorder: 'rgba(164, 146, 214, 0.22)',
      tocBg: 'rgba(165, 150, 214, 0.06)',
      textStrong: 'rgba(238, 232, 249, 0.95)',
      textSoft: 'rgba(224, 213, 245, 0.74)',
      borderSoft: 'rgba(164, 146, 214, 0.2)',
      borderStrong: 'rgba(164, 146, 214, 0.32)',
      surfaceHover: 'rgba(165, 150, 214, 0.1)',
      surfaceActive: 'rgba(165, 150, 214, 0.22)',
      selectBg: 'rgba(165, 150, 214, 0.1)',
      selectText: 'rgba(236, 228, 255, 0.92)',
      selectBorder: 'rgba(164, 146, 214, 0.3)'
    },
    {
      id: 'dark-amber-fog',
      name: '琥珀暮雾',
      accent: '#d29d61',
      siteBg: '#120f0b',
      panelBg: 'rgba(255, 255, 255, 0.03)',
      panelBorder: 'rgba(210, 157, 97, 0.23)',
      tocBg: 'rgba(210, 157, 97, 0.06)',
      textStrong: 'rgba(245, 233, 216, 0.95)',
      textSoft: 'rgba(233, 211, 184, 0.75)',
      borderSoft: 'rgba(210, 157, 97, 0.2)',
      borderStrong: 'rgba(210, 157, 97, 0.31)',
      surfaceHover: 'rgba(210, 157, 97, 0.1)',
      surfaceActive: 'rgba(210, 157, 97, 0.22)',
      selectBg: 'rgba(210, 157, 97, 0.09)',
      selectText: 'rgba(246, 230, 212, 0.92)',
      selectBorder: 'rgba(210, 157, 97, 0.3)'
    }
  ]
};

export function initThemeSwitch(options = {}) {
  const state = loadAppearance();
  applyAppearance(state.mode, state.paletteId);
  applyPreviewTheme(loadPreviewTheme());
  mountGlobalSettings({
    enablePreviewTheme: Boolean(options.enablePreviewTheme)
  });
}

export function getCurrentAppearance() {
  const state = loadAppearance();
  const palette = ensurePaletteForMode(state.mode, state.paletteId);
  return {
    mode: state.mode,
    paletteId: palette.id,
    palette
  };
}

export function getGiscusThemeForMode(mode) {
  return mode === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme) {
  applyPreviewTheme(theme);
}

function mountGlobalSettings({ enablePreviewTheme }) {
  const existing = document.getElementById(SETTINGS_ROOT_ID);
  if (existing) {
    syncSettingsState(existing, { enablePreviewTheme });
    return;
  }

  const root = document.createElement('div');
  root.id = SETTINGS_ROOT_ID;
  root.className = 'global-settings';
  root.innerHTML = `
    <button class="global-settings-trigger" type="button" aria-label="打开主题设置">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.5 3.25h3l.6 2.1a6.98 6.98 0 0 1 1.5.86l2.03-.72 2.13 2.12-.72 2.03c.33.47.62.97.85 1.5l2.11.61v2.99l-2.11.61a7.2 7.2 0 0 1-.85 1.5l.72 2.03-2.13 2.12-2.03-.72a7.28 7.28 0 0 1-1.5.86l-.6 2.1h-3l-.6-2.1a7.2 7.2 0 0 1-1.5-.86l-2.03.72-2.13-2.12.72-2.03a7.2 7.2 0 0 1-.85-1.5l-2.11-.61v-2.99l2.11-.61a7.2 7.2 0 0 1 .85-1.5l-.72-2.03 2.13-2.12 2.03.72c.47-.33.97-.62 1.5-.86l.6-2.1z" stroke="currentColor" stroke-width="1.5" />
        <circle cx="12" cy="12" r="2.75" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>
    <div class="global-settings-menu" hidden>
      <div class="settings-section" data-section="preview-theme">
        <div class="settings-title">文档风格</div>
        <div class="settings-switch" id="preview-theme-switch">
          <button class="settings-option" type="button" data-theme-value="github">GitHub</button>
          <button class="settings-option" type="button" data-theme-value="claude">Claude</button>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">颜色模式</div>
        <div class="settings-switch" id="global-mode-switch">
          <button class="settings-option" type="button" data-mode-value="light">亮色</button>
          <button class="settings-option" type="button" data-mode-value="dark">暗色</button>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">莫奈调色盘</div>
        <div class="settings-palette-grid" id="global-palette-grid"></div>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const trigger = root.querySelector('.global-settings-trigger');
  const menu = root.querySelector('.global-settings-menu');
  const modeSwitch = root.querySelector('#global-mode-switch');
  const paletteGrid = root.querySelector('#global-palette-grid');
  const previewSwitch = root.querySelector('#preview-theme-switch');

  const state = loadAppearance();
  const previewTheme = loadPreviewTheme();

  renderModeSwitch(modeSwitch, state.mode);
  renderPaletteGrid(paletteGrid, state.mode, state.paletteId);
  renderPreviewSwitch(previewSwitch, previewTheme);
  togglePreviewSection(root, enablePreviewTheme);

  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      menu.hidden = true;
    }
  });

  modeSwitch.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-mode-value]');
    if (!btn) return;

    const nextMode = btn.getAttribute('data-mode-value') === 'light' ? 'light' : 'dark';
    const nextPalette = ensurePaletteForMode(nextMode, state.paletteId);

    state.mode = nextMode;
    state.paletteId = nextPalette.id;
    saveAppearance(state);
    applyAppearance(state.mode, state.paletteId);

    renderModeSwitch(modeSwitch, state.mode);
    renderPaletteGrid(paletteGrid, state.mode, state.paletteId);
  });

  paletteGrid.addEventListener('click', (event) => {
    const item = event.target.closest('[data-palette-id]');
    if (!item) return;

    state.paletteId = item.getAttribute('data-palette-id') || state.paletteId;
    state.paletteId = ensurePaletteForMode(state.mode, state.paletteId).id;
    saveAppearance(state);
    applyAppearance(state.mode, state.paletteId);
    renderPaletteGrid(paletteGrid, state.mode, state.paletteId);
  });

  previewSwitch.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-value]');
    if (!btn) return;
    const nextTheme = btn.getAttribute('data-theme-value');
    applyPreviewTheme(nextTheme);
    renderPreviewSwitch(previewSwitch, loadPreviewTheme());
  });
}

function syncSettingsState(root, { enablePreviewTheme }) {
  const state = loadAppearance();
  const previewTheme = loadPreviewTheme();

  const modeSwitch = root.querySelector('#global-mode-switch');
  const paletteGrid = root.querySelector('#global-palette-grid');
  const previewSwitch = root.querySelector('#preview-theme-switch');

  renderModeSwitch(modeSwitch, state.mode);
  renderPaletteGrid(paletteGrid, state.mode, state.paletteId);
  renderPreviewSwitch(previewSwitch, previewTheme);
  togglePreviewSection(root, enablePreviewTheme);
}

function togglePreviewSection(root, enablePreviewTheme) {
  const section = root.querySelector('[data-section="preview-theme"]');
  if (!section) return;
  section.hidden = !enablePreviewTheme;
}

function renderModeSwitch(container, mode) {
  const buttons = container.querySelectorAll('[data-mode-value]');
  buttons.forEach((button) => {
    const value = button.getAttribute('data-mode-value');
    button.classList.toggle('active', value === mode);
  });
}

function renderPreviewSwitch(container, theme) {
  const buttons = container.querySelectorAll('[data-theme-value]');
  buttons.forEach((button) => {
    const value = button.getAttribute('data-theme-value');
    button.classList.toggle('active', value === theme);
  });
}

function renderPaletteGrid(container, mode, activePaletteId) {
  const list = PALETTES[mode] || PALETTES.dark;
  container.innerHTML = list.map((palette) => {
    const activeClass = palette.id === activePaletteId ? ' active' : '';
    return `
      <button class="settings-palette${activeClass}" type="button" data-palette-id="${palette.id}" title="${palette.name}">
        <span class="settings-palette-dot" style="background:${palette.accent};"></span>
        <span class="settings-palette-name">${palette.name}</span>
      </button>
    `;
  }).join('');
}

function applyPreviewTheme(theme) {
  const safeTheme = theme === 'claude' ? 'claude' : 'github';
  document.body.setAttribute('data-theme', safeTheme);
  localStorage.setItem(PREVIEW_THEME_KEY, safeTheme);
  appState.theme = safeTheme;
  window.dispatchEvent(new CustomEvent('previewthemechange', {
    detail: { theme: safeTheme }
  }));
}

function loadPreviewTheme() {
  const saved = localStorage.getItem(PREVIEW_THEME_KEY);
  return saved || siteConfig.defaultTheme || 'github';
}

function applyAppearance(mode, paletteId) {
  const safeMode = mode === 'light' ? 'light' : 'dark';
  const palette = ensurePaletteForMode(safeMode, paletteId);

  document.body.setAttribute('data-mode', safeMode);

  setCssVar('--site-bg', palette.siteBg);
  setCssVar('--site-panel-bg', palette.panelBg);
  setCssVar('--site-panel-border', palette.panelBorder);
  setCssVar('--site-accent', palette.accent);
  setCssVar('--toc-bg', palette.tocBg);
  setCssVar('--text-soft', palette.textSoft);
  setCssVar('--text-strong', palette.textStrong);
  setCssVar('--border-soft', palette.borderSoft);
  setCssVar('--border-strong', palette.borderStrong);
  setCssVar('--surface-hover', palette.surfaceHover);
  setCssVar('--surface-active', palette.surfaceActive);
  setCssVar('--select-bg', palette.selectBg);
  setCssVar('--select-text', palette.selectText);
  setCssVar('--select-border', palette.selectBorder);

  window.dispatchEvent(new CustomEvent('appearancechange', {
    detail: { mode: safeMode, paletteId: palette.id, palette }
  }));
}

function ensurePaletteForMode(mode, paletteId) {
  const list = PALETTES[mode] || PALETTES.dark;
  const match = list.find((item) => item.id === paletteId);
  return match || list[0];
}

function setCssVar(key, value) {
  document.body.style.setProperty(key, value);
}

function loadAppearance() {
  const defaultMode = 'dark';
  const defaultPaletteId = PALETTES[defaultMode][0].id;

  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    if (!raw) {
      return { mode: defaultMode, paletteId: defaultPaletteId };
    }
    const parsed = JSON.parse(raw);
    const mode = parsed && parsed.mode === 'light' ? 'light' : 'dark';
    const paletteId = ensurePaletteForMode(mode, parsed && parsed.paletteId).id;
    return { mode, paletteId };
  } catch (error) {
    return { mode: defaultMode, paletteId: defaultPaletteId };
  }
}

function saveAppearance(state) {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify({
    mode: state.mode,
    paletteId: state.paletteId
  }));
}
