# 博客网站实施计划

## 项目概述

为 GitHub Pages 个人站点搭建一个完整的博客系统，保留现有欢迎页，添加博客功能，实现文章管理和展示。

## 需求说明

- 保留当前欢迎页，样式不可变更，但需要优化以降低卡顿和内存占用
- 欢迎页是默认页面，点击后跳转到博客主页
- 博客主页显示按首字母排序的文章列表
- 支持文章模糊搜索（标题、描述、标签）
- 支持通过时间/字母排序
- 文章格式支持 `.md` 和 `.html` 两种
- 文章页需要代码高亮、目录导航、评论功能
- 使用单页应用（SPA）架构
- 需要丝滑的动画效果

## 实施步骤

### 阶段一：欢迎页性能优化

#### 1.1 合并多个 requestAnimationFrame 循环
- 文件：`scripts/main.js`
- 问题：存在 3 个独立的 RAF 循环（parallax、animateGradientCircles、粒子动画）
- 解决方案：合并为单一循环，统一管理所有动画更新

#### 1.2 实现粒子对象池模式
- 文件：`scripts/main.js`
- 问题：每次移动鼠标都创建新粒子，导致频繁 DOM 操作
- 解决方案：创建粒子池，复用已存在的粒子元素，限制最大粒子数（15 个）

#### 1.3 用 CSS animation 替代部分 JS 动画
- 文件：`scripts/main.js`、`styles/main.css`
- 问题：JS 动态更新渐变色消耗性能
- 解决方案：使用 CSS `@keyframes` 和 `filter: hue-rotate()` 实现渐变动画

#### 1.4 添加事件节流
- 文件：`scripts/main.js`
- 问题：mousemove 事件触发频率过高
- 解决方案：使用 setTimeout 实现节流，限制更新频率到约 60fps

#### 1.5 移除无用代码
- 文件：`scripts/main.js`
- 问题：页面设置了 `overflow: hidden`，但仍然监听 scroll 事件
- 解决方案：移除无用的 scroll 事件监听器

### 阶段二：搭建博客基础架构

#### 2.1 创建路由管理器
- 文件：`scripts/router.js`
- 功能：
  - 基于 Hash 的路由（`#blog`、`#article/xxx`）
  - 欢迎页为默认路径（空 hash）
  - 页面容器切换逻辑
  - 路由切换前后回调

#### 2.2 添加博客容器
- 文件：`welcome_page.html`
- 添加的容器：
  - `#welcome-container` - 欢迎页容器
  - `#blog-container` - 博客列表容器
  - `#article-container` - 文章详情容器

#### 2.3 创建文章配置文件
- 文件：`articles/articles.json`
- 结构：
```json
{
  "articles": [
    {
      "id": "article-id",
      "title": "文章标题",
      "date": "2026-01-01",
      "description": "文章描述",
      "file": "article.md",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

#### 2.4 添加页面切换动画
- 文件：`styles/main.css`
- 动画效果：
  - 页面淡入淡出
  - 横向滑动切换
  - 使用 `opacity` 和 `transform` 优化性能

### 阶段三：实现博客列表页

#### 3.1 创建博客列表逻辑
- 文件：`scripts/blog.js`
- 功能：
  - 加载 `articles.json`
  - 渲染文章卡片列表
  - 响应式网格布局

#### 3.2 实现模糊搜索
- 文件：`scripts/blog.js`
- 搜索范围：标题、描述、标签
- 实现方式：数组过滤 + 防抖（300ms）

#### 3.3 实现排序功能
- 文件：`scripts/blog.js`
- 按字母排序：按标题拼音排序
- 按时间排序：按发布日期排序（最新的在前）

#### 3.4 博客列表样式
- 文件：`styles/main.css`
- 包含：
  - 搜索框样式
  - 排序按钮样式
  - 文章卡片样式
  - 响应式布局

### 阶段四：实现文章页

#### 4.1 创建文章渲染逻辑
- 文件：`scripts/article.js`
- 功能：
  - 加载文章文件
  - 支持 Markdown 和 HTML 格式
  - 渲染文章内容

#### 4.2 集成 Markdown 解析
- 库：marked.js
- CDN：`https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js`
- 配置：
  - 启用 GFM
  - 启用换行
  - 集成代码高亮

#### 4.3 集成代码高亮
- 库：highlight.js
- CDN：
  - 核心：`https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/core.min.js`
  - 主题：`https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css`
- 支持语言：JavaScript、Python、Java、C/C++、HTML、CSS、JSON、Bash、SQL、TypeScript

#### 4.4 生成目录导航
- 文件：`scripts/article.js`
- 功能：
  - 自动提取 h2、h3 标题
  - 生成目录列表
  - 点击跳转到对应位置
  - 滚动时高亮当前章节（IntersectionObserver）

#### 4.5 集成评论系统
- 系统：Giscus（基于 GitHub Discussions）
- 功能：
  - 无需后端服务
  - 支持 GitHub 账号登录
  - 支持深色主题
- 配置步骤：
  1. 访问 https://giscus.app/
  2. 配置仓库和分类
  3. 获取配置参数
  4. 更新 `scripts/article.js` 中的配置

### 阶段五：测试和优化

#### 5.1 性能测试
- 使用浏览器 DevTools Performance 面板
- 检查 CPU 使用率和内存占用
- 目标：CPU 降低 30%，内存降低 20%

#### 5.2 功能测试
- 页面切换
- 搜索功能
- 排序功能
- 文章渲染
- 代码高亮
- 目录导航

#### 5.3 响应式测试
- 桌面端（>1024px）
- 平板端（768px-1024px）
- 移动端（<768px）

#### 5.4 跨浏览器测试
- Chrome/Edge
- Firefox
- Safari

## 文件结构

```
SweerItTer.github.io/
├── articles/                    # 文章文件夹
│   ├── articles.json           # 文章配置文件
│   ├── hello-world.md          # 示例文章 1
│   └── getting-started.md      # 示例文章 2
├── scripts/                     # JavaScript 脚本
│   ├── main.js                 # 欢迎页交互逻辑（已优化）
│   ├── router.js               # 路由管理器
│   ├── blog.js                 # 博客列表逻辑
│   └── article.js              # 文章渲染逻辑
├── styles/                      # 欢迎页样式
│   └── main.css                # 包含欢迎页和博客样式
├── css/                         # 博客页面样式（备用）
│   └── style.css
└── welcome_page.html            # 主 HTML 文件
```

## 技术栈

| 功能 | 技术方案 |
|------|---------|
| 路由 | Hash-based 路由（window.location.hash） |
| Markdown 解析 | marked.js (CDN) |
| 代码高亮 | highlight.js (CDN) |
| 评论系统 | Giscus |
| 页面切换 | CSS transition + JavaScript 控制 |
| 搜索 | JavaScript 数组过滤 |
| 排序 | JavaScript 数组排序 |

## 使用指南

### 添加新文章

1. 在 `articles` 文件夹中创建 Markdown 或 HTML 文件
2. 编辑 `articles/articles.json`，在 `articles` 数组中添加文章信息
3. 提交到 GitHub

### 配置评论系统

1. 访问 https://giscus.app/
2. 配置仓库和分类
3. 编辑 `scripts/article.js` 的 `addComments()` 函数
4. 更新 `data-repo`、`data-repo-id`、`data-category-id` 等参数

### 自定义样式

主要样式文件：`styles/main.css`

颜色主题：
- 主色调：`#667eea`（紫色）
- 辅助色：`#f093fb`（粉色）
- 背景：`#0a0a0a`（深黑色）

## 性能优化措施

1. **合并动画循环**：将多个 RAF 循环合并为一个
2. **对象池模式**：粒子元素复用，减少 DOM 操作
3. **事件节流**：对 mousemove 和 resize 事件进行节流
4. **CSS 动画**：使用 CSS 动画替代部分 JavaScript 动画
5. **懒加载**：博客内容只在需要时加载
6. **IntersectionObserver**：使用现代 API 优化滚动监听

## 注意事项

1. GitHub Pages 是静态托管，无法直接读取文件夹内容，必须使用 JSON 配置文件
2. 添加文章后必须更新 `articles.json`
3. 代码高亮和 Markdown 解析从 CDN 加载，需要网络连接
4. 评论系统需要先在 GitHub 仓库中启用 Discussions 功能
5. 所有样式都包含在 `styles/main.css` 中，`css/style.css` 是备用文件

## 成功标准

- 欢迎页样式完全不变，视觉效果一致
- CPU 使用率降低至少 30%，内存占用减少至少 20%
- 所有博客功能正常工作
- 页面切换动画流畅，无卡顿
- 支持桌面、平板、手机三种设备
- 添加文章只需上传文件并更新 JSON 配置