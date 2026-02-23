# 2026-02-23 Blog UX + Architecture Refresh Design

## Summary
Refactor the static GitHub Pages blog into a cleaner ES Modules structure with minimal coupling, add a fixed left TOC with collapsible sub-levels, implement theme switching (GitHub/Claude), smooth the welcome animations without changing visuals, and enable comments + lightweight analytics via third-party services (Giscus + busuanzi).

## Goals
- Preserve existing visual style, especially the welcome page.
- Make the codebase easier to extend (themes, columns, metrics, extra panels).
- Improve animation smoothness without changing UI behavior.
- Implement fixed, collapsible TOC and layout-linked preview area.
- Add GitHub login comments (Giscus) and visitor/like metrics (busuanzi + Giscus reactions).

## Non-Goals
- No build tooling or server-side features.
- No redesign of the welcome page visuals.
- No backend for analytics or custom auth.

## Proposed Structure
- `assets/`: images, icons, fonts
- `styles/`:
  - `base.css`: resets, CSS variables, typography
  - `layout.css`: overall layout, grid, containers
  - `theme-github.css`: GitHub-like markdown skin
  - `theme-claude.css`: Claude-like markdown skin
  - `components/`: TOC, cards, buttons
- `scripts/`:
  - `core/`: `router.js`, `state.js`
  - `features/`: `blog.js`, `article.js`, `comments.js`, `analytics.js`
  - `ui/`: `toc.js`, `theme-switch.js`
- `config/`: `site-config.js`

## TOC Behavior
- Fixed left column using CSS Grid and `position: sticky`.
- Collapsible behavior:
  - Clicking a heading toggles its direct sub-tree.
  - Only headings with a deeper level than the clicked heading collapse.
  - The collapse range stops at the next heading of the same level.
- TOC visibility toggle:
  - Button at top-right of TOC (`>`), collapses sidebar.
  - When hidden, preview area expands to full width.

## Theme System
- `data-theme="github" | "claude"` on `body`.
- Theme files define markdown colors, code blocks, blockquotes, tables.
- Default theme configurable in `config/site-config.js`.
- Theme switcher is a simple `<select>` in article header.

## Comments + Metrics
- Comments: Giscus with GitHub login, config in `site-config.js`.
- Likes: Giscus reactions enabled.
- Analytics: busuanzi injected via `features/analytics.js`.

## Animation Optimization
- Use a single `requestAnimationFrame` loop.
- Reduce layout thrash and excessive DOM writes.
- Ensure animation smoothness while keeping identical visuals.

## Data Flow
- `core/router` handles hash routes.
- `features/article` loads markdown, renders content, delegates TOC + comments.
- `ui/toc` builds and manages TOC UI state.
- `ui/theme-switch` toggles theme.
- `features/analytics` injects busuanzi once per session.

## Testing Checklist
- Route changes (welcome, blog, article)
- TOC sticky layout and collapse logic
- Theme switching (GitHub/Claude)
- Comment injection and reactions
- Analytics counter renders without errors
- Responsive behavior (mobile/tablet/desktop)

## Risks
- Third-party CDN availability (marked/highlight/busuanzi).
- Giscus requires repo Discussions enabled and config set.

## Open Config
- Giscus repo ID/category ID (to be filled by user)
- Default theme
- Whether to show analytics on list page
