import { appState } from '../core/state.js';

const TOC_HEADING_SELECTOR = '.article-body h2, .article-body h3, .article-body h4';

export function buildTOC(articleContentEl) {
  const tocEl = document.getElementById('article-toc');
  const shellEl = document.getElementById('article-shell');

  if (!tocEl || !shellEl || !articleContentEl) return;

  tocEl.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'article-toc-header';

  const title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = '目录';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toc-toggle';
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('aria-label', 'Toggle TOC');
  toggleBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;

  header.appendChild(title);
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
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => ensureInView(tocEl, link), 220);
    });

    item.appendChild(link);
    list.appendChild(item);

    items.push({ item, link, level, heading });
  });

  addCaretControls(items);
  initScrollSpy(items, tocEl);

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
  const observerOptions = {
    rootMargin: '-100px 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        items.forEach(item => {
          item.link.classList.remove('active');
          if (item.heading.id === id) {
            item.link.classList.add('active');
            ensureInView(tocEl, item.link);
          }
        });
      }
    });
  }, observerOptions);

  items.forEach(item => observer.observe(item.heading));
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
