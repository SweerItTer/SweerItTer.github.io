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
  toggleBtn.textContent = '>';

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
      toggleSubtree(items, index);
    });

    item.appendChild(link);
    list.appendChild(item);

    items.push({ item, link, level, heading });
  });

  initScrollSpy(items);

  toggleBtn.addEventListener('click', () => {
    toggleTOCVisibility(shellEl);
  });
}

function toggleSubtree(items, startIndex) {
  const current = items[startIndex];
  if (!current) return;

  const targetLevel = current.level;
  const isCollapsed = current.item.dataset.collapsed === 'true';
  const nextState = !isCollapsed;
  current.item.dataset.collapsed = nextState ? 'true' : 'false';

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

function initScrollSpy(items) {
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
          }
        });
      }
    });
  }, observerOptions);

  items.forEach(item => observer.observe(item.heading));
}

export function toggleTOCVisibility(shellEl) {
  if (!shellEl) return;

  const isCollapsed = shellEl.classList.toggle('toc-collapsed');
  appState.tocCollapsed = isCollapsed;
}
