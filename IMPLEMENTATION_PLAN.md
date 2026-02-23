# Implementation Plan (Updated 2026-02-23)

This file summarizes the current implementation direction. The detailed plan lives in:
- docs/plans/2026-02-23-structure-toc-theme-comments-plan.md

## Scope
- ES Modules refactor for low-coupling extensibility.
- Sticky, collapsible TOC with layout-linked preview area.
- Theme switching (GitHub / Claude) via CSS variables.
- Giscus comments + reactions, busuanzi analytics.
- Smooth welcome page animations without visual change.
- Clean unused files and sample content.

## Key Files
- config/site-config.js
- scripts/core/*, scripts/features/*, scripts/ui/*
- styles/base.css, styles/layout.css, styles/theme-*.css

## Notes
- GitHub Pages static hosting only; all features must be client-side.
- Giscus requires repo Discussions and config IDs.
