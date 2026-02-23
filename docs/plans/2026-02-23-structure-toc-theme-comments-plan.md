# Blog UX + Architecture Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the static blog for clean ES-module structure, add fixed/collapsible TOC, theme switching, analytics, and Giscus comments while preserving existing visuals.

**Architecture:** Keep GitHub Pages static hosting. Use ES Modules with a small core/router and feature modules. Themes are CSS-only with `data-theme` switches. TOC is built client-side from rendered headings.

**Tech Stack:** HTML, CSS, Vanilla JS (ES Modules), marked.js, highlight.js, Giscus, busuanzi.

---

### Task 1: Create config and new directory structure

**Files:**
- Create: `config/site-config.js`
- Create: `styles/base.css`
- Create: `styles/layout.css`
- Create: `styles/theme-github.css`
- Create: `styles/theme-claude.css`
- Create: `scripts/core/state.js`
- Create: `scripts/ui/theme-switch.js`

**Step 1: Write a minimal config module**

```js
export const siteConfig = {
  defaultTheme: 'github',
  analytics: { provider: 'busuanzi', enabled: true },
  giscus: {
    repo: 'SweerItTer/SweerItTer.github.io',
    repoId: '',
    category: 'Announcements',
    categoryId: ''
  }
};
```

**Step 2: Verify module import works**

Run: open `welcome_page.html` in a local server and check console for no import errors.
Expected: no `Uncaught SyntaxError: Cannot use import statement outside a module`.

**Step 3: Commit**

```bash
git add config/site-config.js styles/base.css styles/layout.css styles/theme-github.css styles/theme-claude.css scripts/core/state.js scripts/ui/theme-switch.js
git commit -m "chore: add config and theme scaffolding"
```

### Task 2: Restructure existing JS into ES modules

**Files:**
- Modify: `welcome_page.html`
- Modify: `scripts/router.js`
- Modify: `scripts/blog.js`
- Modify: `scripts/article.js`
- Create: `scripts/features/comments.js`
- Create: `scripts/features/analytics.js`
- Create: `scripts/ui/toc.js`

**Step 1: Convert script entry to module**

Update `welcome_page.html` to use a single `type="module"` entry script.

**Step 2: Export/import APIs**

Make `router`, `blog`, `article` export functions and import where needed.

**Step 3: Commit**

```bash
git add welcome_page.html scripts/router.js scripts/blog.js scripts/article.js scripts/features/comments.js scripts/features/analytics.js scripts/ui/toc.js
git commit -m "refactor: convert scripts to ES modules"
```

### Task 3: Implement TOC sidebar + collapse logic

**Files:**
- Modify: `styles/layout.css`
- Modify: `scripts/ui/toc.js`
- Modify: `scripts/features/article.js`

**Step 1: Build sticky TOC container**

Use CSS Grid with left column for TOC and right column for article preview.

**Step 2: Implement collapse behavior**

When clicking a heading in TOC, collapse only deeper-level headings until next same-level heading.

**Step 3: Add TOC toggle button**

Add `>` button to hide/show TOC and expand article column.

**Step 4: Manual check**

Run: open an article page and click TOC headings.
Expected: correct subtree collapses, preview width expands when TOC hidden.

**Step 5: Commit**

```bash
git add styles/layout.css scripts/ui/toc.js scripts/features/article.js
git commit -m "feat: add sticky collapsible TOC and layout toggle"
```

### Task 4: Add theme switching

**Files:**
- Modify: `welcome_page.html`
- Modify: `styles/theme-github.css`
- Modify: `styles/theme-claude.css`
- Modify: `scripts/ui/theme-switch.js`

**Step 1: Add theme dropdown**

Add a `<select>` in article header to change `data-theme`.

**Step 2: Implement switching logic**

Persist selection in `localStorage` and apply on load.

**Step 3: Manual check**

Switch between GitHub and Claude themes.
Expected: markdown appearance changes without layout breakage.

**Step 4: Commit**

```bash
git add welcome_page.html styles/theme-github.css styles/theme-claude.css scripts/ui/theme-switch.js
git commit -m "feat: add markdown theme switcher"
```

### Task 5: Add comments + analytics

**Files:**
- Modify: `scripts/features/comments.js`
- Modify: `scripts/features/analytics.js`
- Modify: `scripts/features/article.js`

**Step 1: Giscus injection**

Load Giscus only when config is complete.

**Step 2: busuanzi injection**

Inject script once and show PV/UV elements where needed.

**Step 3: Manual check**

Expected: no errors when config missing; metrics placeholders render.

**Step 4: Commit**

```bash
git add scripts/features/comments.js scripts/features/analytics.js scripts/features/article.js
git commit -m "feat: add giscus comments and busuanzi analytics"
```

### Task 6: Animation smoothing without visual changes

**Files:**
- Modify: `scripts/main.js`
- Modify: `styles/base.css` (if needed)

**Step 1: Review animation loop**

Ensure a single RAF loop and avoid redundant DOM writes.

**Step 2: Manual check**

Expected: welcome page motion is visibly smoother with same visuals.

**Step 3: Commit**

```bash
git add scripts/main.js styles/base.css
git commit -m "perf: smooth welcome animations"
```

### Task 7: Clean up unused files and update docs

**Files:**
- Delete: `css/style.css`
- Delete: `articles/hello-world.md`
- Delete: `articles/getting-started.md`
- Modify: `README.md`
- Modify: `IMPLEMENTATION_PLAN.md`

**Step 1: Remove unused or sample files**

Delete unused CSS and sample articles per request.

**Step 2: Update README + plan**

Document new structure and configuration.

**Step 3: Commit**

```bash
git add README.md IMPLEMENTATION_PLAN.md
git rm css/style.css articles/hello-world.md articles/getting-started.md
git commit -m "chore: cleanup and update docs"
```

### Task 8: End-to-end verification

**Step 1: Local server**

Run: `python -m http.server 8000`
Expected: `Serving HTTP on ...`.

**Step 2: Smoke checks**

- Welcome page loads and animates smoothly.
- Blog list renders and search/sort works.
- Article page shows sticky TOC + toggle.
- Theme switcher works.
- Comments/analytics load gracefully.

**Step 3: Commit (if any fixes)**

```bash
git add -A
git commit -m "chore: finalize verification fixes"
```
