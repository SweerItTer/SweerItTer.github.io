# 个人博客（多页面静态版）

本项目是基于 GitHub Pages 的纯前端博客站点，采用多页面结构：
- `welcome_page.html`：欢迎页
- `blog.html`：文章列表页
- `article.html?id=<articleId>`：文章详情页

## 当前特性
- 保留欢迎页原有视觉风格与交互动效
- 列表页支持搜索、排序、文章卡片跳转
- 详情页支持固定目录、目录折叠、目录跳转
- 支持主题切换（GitHub / Claude）
- 支持评论区（Giscus，按文章独立映射）
- 支持阅读/访问统计（Busuanzi）
- 支持 GitHub Contents API 自动识别 `articles/` 目录文章
- 支持 API 不可用场景下的缓存与降级兜底

## 用户流程（验收路径）
1. 打开站点默认进入 `welcome_page.html`。
2. 点击欢迎页进入 `blog.html` 列表页。
3. 列表页优先读取 `articles/articles.index.json`；若不可用再尝试 GitHub API；若 API 受限（如 403）则回退到缓存或 `fallbackFiles`。
4. 点击文章卡片进入 `article.html?id=<articleId>`。
5. 详情页布局为“左侧目录 + 中间正文 + 右上主题切换 + 底部评论区”。

## 本地运行
请勿使用 `file://` 直接打开页面，建议启动本地静态服务器。

### 方式一（Python）
```bash
python -m http.server 8000
```
访问：`http://localhost:8000/welcome_page.html`

### 方式二（Node.js）
```bash
npm install -g http-server
http-server -p 8000
```
访问：`http://localhost:8000/welcome_page.html`

## 文章管理
### 新增文章
1. 在 `articles/` 目录新增 `.md` 或 `.html` 文件。
2. 可选：在 Markdown 文首使用 Front Matter：
```yaml
---
title: 示例标题
date: 2026-02-23
description: 一句话摘要
---
```
3. 推送到仓库后，列表页会自动识别。

### 数据源策略
- 主策略：读取部署期生成的 `articles/articles.index.json`
- 次策略：GitHub Contents API 拉取文章清单
- 一级兜底：`sessionStorage`
- 二级兜底：`localStorage`
- 三级兜底：`config/site-config.js` 中 `fallbackFiles`

### 自动生成索引（减少运行时 API 调用）
- 工作流文件：`.github/workflows/generate-articles-index.yml`
- 触发条件：`main` 分支提交涉及 `articles/**` 时自动触发
- 生成脚本：`scripts/tools/generate-articles-index.mjs`
- 输出文件：`articles/articles.index.json`

## 评论系统（Giscus）
配置文件：`config/site-config.js`

需要配置：
- `giscus.repo`
- `giscus.repoId`
- `giscus.category`
- `giscus.categoryId`

说明：
- 当前项目采用“每篇文章独立评论串”策略。
- 当 `repoId` 或 `categoryId` 为空时，页面会显示“评论功能暂未启用”。

### repoId / categoryId 从哪里来
1. 打开 `https://giscus.app/zh-CN`
2. 选择你的仓库与 Discussion 分类
3. 页面会自动生成 `<script>` 配置
4. 复制其中的 `data-repo-id` 与 `data-category-id` 到 `config/site-config.js`

## 目录结构
```text
SweerItTer.github.io/
├─ articles/
├─ config/
│  └─ site-config.js
├─ docs/
├─ scripts/
│  ├─ core/
│  ├─ features/
│  ├─ pages/
│  └─ ui/
├─ styles/
├─ welcome_page.html
├─ blog.html
├─ article.html
├─ index.html
└─ _README.md
```

## 部署
1. 推送到 GitHub 仓库默认分支（如 `main`）
2. 在仓库 Settings -> Pages 中启用 GitHub Pages
3. 确认部署目录为仓库根目录

## 常见问题
### 列表页空白
通常是 GitHub API 403 或网络问题，系统会自动尝试缓存与 fallback 文件。

### 评论区不显示
请先确认 `repoId` 与 `categoryId` 已配置且仓库已启用 Discussions。

### 统计数字一直是 `-`
Busuanzi 服务未返回数据时会显示 `-`，通常稍后刷新可恢复。
