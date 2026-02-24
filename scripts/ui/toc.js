import { appState } from '../core/state.js';

const TOC_HEADING_SELECTOR = '.article-body h2, .article-body h3, .article-body h4';
const ACTIVE_TOP_OFFSET = 140;
const CLICK_ACTIVE_LOCK_MS = 900;
const TOP_BTN_VISIBLE_SCROLL = 24;
let disposeScrollSpy = null;
let floatingTopButton = null;
let floatingTopButtonBound = false;

export function buildTOC(articleContentEl) {
  const tocEl = document.getElementById('article-toc');
  const shellEl = document.getElementById('article-shell');

  if (!tocEl || !shellEl || !articleContentEl) return;

  tocEl.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'article-toc-header';
  ensureFloatingTopButton(tocEl);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toc-toggle';
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('aria-label', 'Toggle TOC');
  toggleBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;

  header.appendChild(toggleBtn);
  tocEl.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'toc-list';
  tocEl.appendChild(list);

  const headings = articleContentEl.querySelectorAll(TOC_HEADING_SELECTOR);
  if (!headings.length) {
    tocEl.classList.add('toc-empty');
    shellEl.classList.add('toc-collapsed');
    return;
  }

  tocEl.classList.remove('toc-empty');
  shellEl.classList.remove('toc-collapsed');

  const items = [];
  let scrollSpyController = null;

  headings.forEach((heading, index) => {
    const level = Number(heading.tagName.replace('H', '')) || 2;
    const id = `heading-${index}`;
    heading.id = id;

    const item = document.createElement('li');
    item.className = `toc-item toc-level-${level}`;
    item.dataset.level = String(level);
    item.dataset.index = String(index);

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'toc-link';
    link.textContent = heading.textContent || `Section ${index + 1}`;
    link.addEventListener('click', () => {
      if (scrollSpyController) {
        scrollSpyController.markManual(heading.id);
      }
      setActiveByHeadingId(items, heading.id, tocEl);
      startTocChaseMotion(tocEl);
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => ensureInView(tocEl, link), 220);
    });

    item.appendChild(link);
    list.appendChild(item);

    items.push({ item, link, level, heading });
  });

  addCaretControls(items);
  if (disposeScrollSpy) {
    disposeScrollSpy();
    disposeScrollSpy = null;
  }
  scrollSpyController = initScrollSpy(items, tocEl);
  disposeScrollSpy = scrollSpyController.dispose;

  toggleBtn.addEventListener('click', () => {
    toggleTOCVisibility(shellEl);
  });

  // ensure TOC is visible for new article load
  shellEl.classList.remove('toc-collapsed');
}

function addCaretControls(items) {
  items.forEach((current, index) => {
    const hasChildren = findNextSameOrHigher(items, index) > index + 1;
    if (!hasChildren) return;

    const caret = document.createElement('button');
    caret.type = 'button';
    caret.className = 'toc-caret';
    caret.setAttribute('aria-label', 'Toggle section');
    caret.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    `;
    caret.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSubtree(items, index, caret);
    });

    current.item.appendChild(caret);
  });
}

function findNextSameOrHigher(items, startIndex) {
  const baseLevel = items[startIndex].level;
  for (let i = startIndex + 1; i < items.length; i += 1) {
    if (items[i].level <= baseLevel) return i;
  }
  return items.length;
}

function toggleSubtree(items, startIndex, caret) {
  const current = items[startIndex];
  if (!current) return;

  const targetLevel = current.level;
  const isCollapsed = current.item.dataset.collapsed === 'true';
  const nextState = !isCollapsed;
  current.item.dataset.collapsed = nextState ? 'true' : 'false';
  if (caret) {
    caret.innerHTML = nextState
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
  }

  for (let i = startIndex + 1; i < items.length; i += 1) {
    const item = items[i];
    if (item.level <= targetLevel) break;

    if (nextState) {
      item.item.classList.add('is-hidden');
      item.item.dataset.collapsed = 'false';
    } else {
      item.item.classList.remove('is-hidden');
    }
  }
}

function initScrollSpy(items, tocEl) {
  const articleContainer = document.getElementById('article-container');
  const scrollTarget = articleContainer || window;
  let rafId = 0;
  let manualHeadingId = '';
  let manualUntil = 0;

  const updateActive = () => {
    const now = Date.now();
    if (manualHeadingId && now < manualUntil) {
      setActiveByHeadingId(items, manualHeadingId, tocEl);
      return;
    }

    manualHeadingId = '';
    manualUntil = 0;

    let active = items[0];
    for (const item of items) {
      const top = item.heading.getBoundingClientRect().top;
      if (top <= ACTIVE_TOP_OFFSET) {
        active = item;
      } else {
        break;
      }
    }

    if (active) {
      setActiveByHeadingId(items, active.heading.id, tocEl);
    }
  };

  const onTick = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateActive();
    });
  };

  scrollTarget.addEventListener('scroll', onTick, { passive: true });
  window.addEventListener('resize', onTick);
  updateActive();

  return {
    markManual(headingId) {
      manualHeadingId = headingId;
      manualUntil = Date.now() + CLICK_ACTIVE_LOCK_MS;
      updateActive();
    },
    dispose() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      scrollTarget.removeEventListener('scroll', onTick);
      window.removeEventListener('resize', onTick);
    }
  };
}

function setActiveByHeadingId(items, headingId, tocEl) {
  items.forEach((item) => {
    const isActive = item.heading.id === headingId;
    item.link.classList.toggle('active', isActive);
    if (isActive) {
      ensureInView(tocEl, item.link);
    }
  });
}

function ensureInView(container, element) {
  if (!container || !element) return;
  const cRect = container.getBoundingClientRect();
  const eRect = element.getBoundingClientRect();
  if (eRect.top < cRect.top) {
    container.scrollTop -= (cRect.top - eRect.top + 12);
  } else if (eRect.bottom > cRect.bottom) {
    container.scrollTop += (eRect.bottom - cRect.bottom + 12);
  }
}

export function toggleTOCVisibility(shellEl) {
  if (!shellEl) return;

  const isCollapsed = shellEl.classList.toggle('toc-collapsed');
  appState.tocCollapsed = isCollapsed;
}

function startTocChaseMotion(tocEl) {
  if (!tocEl) return;
  tocEl.classList.remove('toc-chasing');
  void tocEl.offsetWidth;
  tocEl.classList.add('toc-chasing');
}

function ensureFloatingTopButton(tocEl) {
  if (!floatingTopButton) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'floating-top-btn';
    button.setAttribute('aria-label', '回到顶部');
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(button);
    floatingTopButton = button;
  }

  if (!floatingTopButtonBound) {
    const scrollHost = getScrollHost();
    const onScroll = () => {
      const scrollTop = getScrollTop(scrollHost);
      floatingTopButton.classList.toggle('is-visible', scrollTop > TOP_BTN_VISIBLE_SCROLL);
    };

    floatingTopButton.addEventListener('click', () => {
      const host = getScrollHost();
      if (host === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        host.scrollTo({ top: 0, behavior: 'smooth' });
      }
      startTocChaseMotion(tocEl);
    });

    scrollHost.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    floatingTopButtonBound = true;
  }
}

function getScrollHost() {
  return document.getElementById('article-container') || window;
}

function getScrollTop(host) {
  if (host === window) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }
  return host.scrollTop || 0;
}
