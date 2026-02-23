# 开始使用本博客

本指南将帮助你了解如何使用和管理这个博客系统。

## 博客架构

本博客采用单页应用（SPA）架构，基于以下技术：

- **前端框架**：原生 JavaScript（无框架依赖）
- **路由系统**：基于 Hash 的路由管理
- **Markdown 解析**：marked.js
- **代码高亮**：highlight.js
- **评论系统**：Giscus（可选）

## 文件结构

```
SweerItTer.github.io/
├── articles/              # 文章文件夹
│   ├── articles.json      # 文章配置文件
│   ├── hello-world.md     # 示例文章 1
│   └── getting-started.md # 示例文章 2
├── scripts/               # JavaScript 脚本
│   ├── main.js           # 欢迎页逻辑
│   ├── router.js         # 路由管理
│   ├── blog.js           # 博客列表逻辑
│   └── article.js        # 文章渲染逻辑
├── styles/               # 欢迎页样式
│   └── main.css
├── css/                  # 博客页面样式
│   └── style.css
└── welcome_page.html     # 主 HTML 文件
```

## 如何添加文章

### 1. 创建文章文件

在 `articles` 文件夹中创建新的 Markdown 或 HTML 文件。

**Markdown 示例（my-article.md）：**

```markdown
# 文章标题

文章摘要或简介...

## 第一部分

正文内容...

## 第二部分

更多内容...
```

### 2. 更新配置文件

编辑 `articles/articles.json`，在 `articles` 数组中添加文章信息：

```json
{
  "articles": [
    {
      "id": "my-article",
      "title": "我的新文章",
      "date": "2026-02-23",
      "description": "这是一篇新文章的描述",
      "file": "my-article.md",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

**配置说明：**

- `id`：文章唯一标识符（用于 URL）
- `title`：文章标题
- `date`：发布日期（YYYY-MM-DD 格式）
- `description`：文章摘要
- `file`：文章文件名（必须是 articles 文件夹中的文件）
- `tags`：标签数组（可选）

### 3. 提交到 GitHub

```bash
git add articles/my-article.md
git add articles/articles.json
git commit -m "Add new article: my-article"
git push origin main
```

## 功能特性

### 搜索功能

博客列表页支持模糊搜索，可以搜索：

- 文章标题
- 文章描述
- 文章标签

### 排序功能

支持两种排序方式：

- **按字母**：按文章标题拼音排序
- **按时间**：按发布日期排序（最新的在前）

### 代码高亮

支持多种编程语言的代码高亮：

- JavaScript / TypeScript
- Python
- Java
- C/C++
- HTML / CSS
- JSON
- Bash
- SQL

### 目录导航

文章会自动生成目录导航，点击可以跳转到对应章节。滚动时自动高亮当前章节。

## 配置评论系统

本博客集成了 Giscus 评论系统，基于 GitHub Discussions。

### 配置步骤

1. 访问 [Giscus 官网](https://giscus.app/)
2. 按照提示配置：
   - 选择仓库
   - 选择 Discussions 分类
   - 选择语言和主题
3. 复制生成的配置
4. 编辑 `scripts/article.js`，找到 `addComments()` 函数
5. 更新 `data-repo`、`data-repo-id`、`data-category-id` 等参数

### 注意事项

- 需要先在 GitHub 仓库中启用 Discussions 功能
- 仓库必须是公开的
- 访客需要有 GitHub 账号才能评论

## 自定义样式

### 修改欢迎页样式

编辑 `styles/main.css`，这里包含了欢迎页的所有样式。

### 修改博客页面样式

编辑 `styles/main.css`，在文件末尾的博客相关样式区域进行修改。

### 修改颜色主题

主要的颜色变量：

- 主色调：`#667eea`（紫色）
- 辅助色：`#f093fb`（粉色）
- 背景：`#0a0a0a`（深黑色）
- 文字：`rgba(255, 255, 255, 0.9)`（白色）

## 性能优化

本博客已经进行了多项性能优化：

- **合并动画循环**：将多个 requestAnimationFrame 循环合并为一个
- **对象池模式**：粒子元素复用，减少 DOM 操作
- **事件节流**：对 mousemove 和 resize 事件进行节流
- **CSS 动画**：使用 CSS 动画替代部分 JavaScript 动画
- **懒加载**：博客内容只在需要时加载

## 常见问题

### Q: 文章不显示？

A: 检查以下几点：
1. 文件是否在 `articles` 文件夹中
2. `articles.json` 中是否正确配置了文章信息
3. 文件名是否与配置中的 `file` 字段匹配

### Q: 搜索不工作？

A: 刷新页面重试，或者检查浏览器控制台是否有错误。

### Q: 代码不高亮？

A: 检查网络连接，因为代码高亮库从 CDN 加载。

## 总结

希望这个指南能帮助你快速上手本博客系统！如有任何问题，欢迎通过评论功能提出。