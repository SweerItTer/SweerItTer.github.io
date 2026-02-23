# 个人博客 - Personal Blog

一个基于 GitHub Pages 的静态博客系统，具有美观的欢迎页和完整的博客功能。

## 功能特性

- 🎨 **精美的欢迎页** - 带有渐变背景、粒子效果和丝滑动画
- 📝 **博客系统** - 支持 Markdown 和 HTML 格式文章
- 🔍 **搜索功能** - 支持标题、描述、标签的模糊搜索
- 📊 **排序功能** - 按字母或时间排序
- 💻 **代码高亮** - 支持多种编程语言的代码高亮
- 📑 **目录导航** - 自动生成文章目录，支持滚动高亮
- 💬 **评论系统** - 集成 Giscus（基于 GitHub Discussions）
- 📱 **响应式设计** - 支持桌面、平板、手机
- ⚡ **性能优化** - 优化的动画循环和内存管理

## 本地开发

由于浏览器安全策略，直接打开 HTML 文件（`file://` 协议）会阻止加载本地 JSON 文件。需要使用本地服务器。

### 方法一：使用 Python（推荐）

如果你已安装 Python 3：

```bash
# 在项目根目录下执行
python -m http.server 8000
```

然后在浏览器中访问：`http://localhost:8000/welcome_page.html`

### 方法二：使用 Node.js

如果你已安装 Node.js：

```bash
# 安装 http-server（只需安装一次）
npm install -g http-server

# 在项目根目录下执行
http-server -p 8000
```

然后在浏览器中访问：`http://localhost:8000/welcome_page.html`

### 方法三：使用 VS Code Live Server

如果你使用 VS Code：

1. 安装 "Live Server" 扩展
2. 右键点击 `welcome_page.html`
3. 选择 "Open with Live Server"

## 添加文章

### 1. 创建文章文件

在 `articles` 文件夹中创建新的 Markdown 或 HTML 文件。

**示例（my-article.md）：**

```markdown
# 文章标题

文章摘要或简介...

## 第一部分

正文内容...

## 第二部分

更多内容...

### 代码示例

```javascript
function hello() {
    console.log('Hello, World!');
}
```
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
      "tags": ["tech", "tutorial"]
    }
  ]
}
```

**字段说明：**

| 字段 | 说明 | 必填 |
|------|------|------|
| `id` | 文章唯一标识符（用于 URL） | 是 |
| `title` | 文章标题 | 是 |
| `date` | 发布日期（YYYY-MM-DD 格式） | 是 |
| `description` | 文章摘要 | 是 |
| `file` | 文章文件名（必须在 articles 文件夹中） | 是 |
| `tags` | 标签数组 | 否 |

### 3. 提交到 GitHub

```bash
git add articles/my-article.md
git add articles/articles.json
git commit -m "Add new article: my-article"
git push origin main
```

## 配置评论系统

本博客使用 Giscus 评论系统，基于 GitHub Discussions。

### 配置步骤

1. 访问 [Giscus 官网](https://giscus.app/)
2. 按照提示配置：
   - 输入你的 GitHub 仓库（如：`SweerItTer/SweerItTer.github.io`）
   - 选择 Discussions 分类
   - 选择语言和主题
3. 复制生成的配置参数
4. 编辑 `scripts/article.js`，找到 `addComments()` 函数
5. 更新以下参数：

```javascript
const giscusConfig = {
    repo: '你的用户名/你的仓库名',     // 例如：SweerItTer/SweerItTer.github.io
    repoId: '从 Giscus 获取的仓库 ID',
    category: '选择的分类名称',
    categoryId: '从 Giscus 获取的分类 ID'
};
```

### 注意事项

- 仓库必须是公开的
- 需要先在 GitHub 仓库中启用 Discussions 功能
- 访客需要有 GitHub 账号才能评论

## 文件结构

```
SweerItTer.github.io/
├── articles/              # 文章文件夹
│   ├── articles.json      # 文章配置文件
│   ├── hello-world.md     # 示例文章 1
│   └── getting-started.md # 示例文章 2
├── scripts/               # JavaScript 脚本
│   ├── main.js           # 欢迎页交互逻辑
│   ├── router.js         # 路由管理器
│   ├── blog.js           # 博客列表逻辑
│   └── article.js        # 文章渲染逻辑
├── styles/               # 样式文件
│   └── main.css          # 包含所有样式
├── css/                  # 备用样式文件
│   └── style.css
├── welcome_page.html     # 主 HTML 文件
├── README.md             # 说明文档
└── IMPLEMENTATION_PLAN.md # 实施计划文档
```

## 自定义样式

主要样式文件：`styles/main.css`

### 修改颜色主题

找到以下变量并修改：

```css
/* 主色调 */
--primary-color: #667eea;  /* 紫色 */

/* 辅助色 */
--secondary-color: #f093fb;  /* 粉色 */

/* 背景色 */
--bg-color: #0a0a0a;  /* 深黑色 */
```

## 性能优化

本博客已进行多项性能优化：

- **合并动画循环** - 将多个 `requestAnimationFrame` 循环合并
- **对象池模式** - 粒子元素复用，减少 DOM 操作
- **事件节流** - 对 `mousemove` 和 `resize` 事件进行节流
- **CSS 动画** - 使用 CSS 动画替代部分 JavaScript 动画
- **懒加载** - 博客内容只在需要时加载

## 代码高亮支持

支持以下编程语言：

- JavaScript / TypeScript
- Python
- Java
- C/C++
- HTML / CSS
- JSON
- Bash
- SQL

如需添加更多语言支持，编辑 `scripts/article.js` 的 `initCodeHighlight()` 函数。

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. 访问仓库的 Settings → Pages
3. 确保 Source 设置为 `Deploy from a branch`，分支为 `main`
4. 几分钟后访问：`https://你的用户名.github.io/`

## 常见问题

### Q: 文章不显示？

A: 检查以下几点：
- 文件是否在 `articles` 文件夹中
- `articles.json` 中是否正确配置了文章信息
- 文件名是否与配置中的 `file` 字段匹配
- 本地开发时是否使用了本地服务器

### Q: 搜索不工作？

A: 刷新页面重试，或检查浏览器控制台是否有错误。

### Q: 代码不高亮？

A: 检查网络连接，代码高亮库从 CDN 加载。

### Q: 评论功能显示"未启用"？

A: 需要先配置 Giscus，参考上文"配置评论系统"部分。

## 技术栈

| 功能 | 技术方案 |
|------|---------|
| 前端框架 | 原生 JavaScript（无框架依赖） |
| 路由 | Hash-based 路由 |
| Markdown 解析 | marked.js |
| 代码高亮 | highlight.js |
| 评论系统 | Giscus |
| 页面切换 | CSS transition + JavaScript |

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过评论区或 GitHub Issues 联系。