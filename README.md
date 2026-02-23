# 个人博客 - Personal Blog

一个基�?GitHub Pages 的静态博客系统，具有美观的欢迎页和完整的博客功能�?

## 功能特�?

- 🎨 **精美的欢迎页** - 带有渐变背景、粒子效果和丝滑动画
- 📝 **博客系统** - 支持 Markdown �?HTML 格式文章
- 🔍 **搜索功能** - 支持标题、描述、标签的模糊搜索
- 📊 **排序功能** - 按字母或时间排序
- 💻 **代码高亮** - 支持多种编程语言的代码高�?
- 📑 **目录导航** - 自动生成文章目录，支持滚动高�?
- 💬 **评论系统** - 集成 Giscus（基�?GitHub Discussions�?
- 📱 **响应式设�?* - 支持桌面、平板、手�?
- �?**性能优化** - 优化的动画循环和内存管理

## 本地开�?

由于浏览器安全策略，直接打开 HTML 文件（`file://` 协议）会阻止加载本地 JSON 文件。需要使用本地服务器�?

### 方法一：使�?Python（推荐）

如果你已安装 Python 3�?

```bash
# 在项目根目录下执�?
python -m http.server 8000
```

然后在浏览器中访问：`http://localhost:8000/welcome_page.html`

### 方法二：使用 Node.js

如果你已安装 Node.js�?

```bash
# 安装 http-server（只需安装一次）
npm install -g http-server

# 在项目根目录下执�?
http-server -p 8000
```

然后在浏览器中访问：`http://localhost:8000/welcome_page.html`

### 方法三：使用 VS Code Live Server

如果你使�?VS Code�?

1. 安装 "Live Server" 扩展
2. 右键点击 `welcome_page.html`
3. 选择 "Open with Live Server"

## 添加文章

### 1. 创建文章文件

�?`articles` 文件夹中创建新的 Markdown �?HTML 文件�?

**示例（my-article.md）：**

```markdown
# 文章标题

文章摘要或简�?..

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

### 2. �ύ�� GitHub

```bash
# ֻ��Ҫ�ύ�����ļ�
git add articles/my-article.md
git commit -m "Add new article: my-article"
git push origin main
```

### 3. 提交�?GitHub

```bash
git add articles/my-article.md
git commit -m "Add new article: my-article"
git push origin main
```

## 配置评论系统

本博客使�?Giscus 评论系统，基�?GitHub Discussions�?

### 配置步骤

1. 访问 [Giscus 官网](https://giscus.app/)
2. 按照提示配置�?
   - 输入你的 GitHub 仓库（如：`SweerItTer/SweerItTer.github.io`�?
   - 选择 Discussions 分类
   - 选择语言和主�?
3. 复制生成的配置参�?
4. 编辑 `scripts/article.js`，找�?`addComments()` 函数
5. 更新以下参数�?

```javascript
const giscusConfig = {
    repo: '你的用户�?你的仓库�?,     // 例如：SweerItTer/SweerItTer.github.io
    repoId: '�?Giscus 获取的仓�?ID',
    category: '选择的分类名�?,
    categoryId: '�?Giscus 获取的分�?ID'
};
```

### 注意事项

- 仓库必须是公开�?
- 需要先�?GitHub 仓库中启�?Discussions 功能
- 访客需要有 GitHub 账号才能评论

## �ļ��ṹ

```
SweerItTer.github.io/
������ articles/              # �����ļ��У�GitHub API �Զ�ʶ��
��   ������ hello-world.md     # ʾ������
������ scripts/               # JavaScript �ű�
��   ������ core/
��   ������ features/
��   ������ ui/
������ styles/                # ��ʽ�ļ�
��   ������ main.css
��   ������ base.css
��   ������ layout.css
��   ������ theme-github.css
��   ������ theme-claude.css
������ config/
��   ������ site-config.js
������ welcome_page.html
������ README.md
```

## �Զ�����ʽ

主要样式文件：`styles/main.css`

### 修改颜色主题

找到以下变量并修改：

```css
/* 主色�?*/
--primary-color: #667eea;  /* 紫色 */

/* 辅助�?*/
--secondary-color: #f093fb;  /* 粉色 */

/* 背景�?*/
--bg-color: #0a0a0a;  /* 深黑�?*/
```

## 性能优化

本博客已进行多项性能优化�?

- **合并动画循环** - 将多�?`requestAnimationFrame` 循环合并
- **对象池模�?* - 粒子元素复用，减�?DOM 操作
- **事件节流** - �?`mousemove` �?`resize` 事件进行节流
- **CSS 动画** - 使用 CSS 动画替代部分 JavaScript 动画
- **懒加�?* - 博客内容只在需要时加载

## 代码高亮支持

支持以下编程语言�?

- JavaScript / TypeScript
- Python
- Java
- C/C++
- HTML / CSS
- JSON
- Bash
- SQL

如需添加更多语言支持，编�?`scripts/article.js` �?`initCodeHighlight()` 函数�?

## 部署�?GitHub Pages

1. 将代码推送到 GitHub 仓库�?`main` 分支
2. 访问仓库�?Settings �?Pages
3. 确保 Source 设置�?`Deploy from a branch`，分支为 `main`
4. 几分钟后访问：`https://你的用户�?github.io/`

## 常见问题

### Q: 文章不显示？

## Theme and Analytics (Added 2026-02-23)
- Theme switcher: Article header includes a theme dropdown (GitHub / Claude).
- Giscus comments: Configure repoId/categoryId in `config/site-config.js`.
- Analytics: busuanzi enabled by default (display locked per session on the same article).
- Structure: ES Modules under `scripts/`, themes in `styles/`.

A: 检查以下几点：
- 文件是否�?`articles` 文件夹中
- `` 中是否正确配置了文章信息
- 文件名是否与配置中的 `file` 字段匹配
- 本地开发时是否使用了本地服务器

### Q: 搜索不工作？

A: 刷新页面重试，或检查浏览器控制台是否有错误�?

### Q: 代码不高亮？

A: 检查网络连接，代码高亮库从 CDN 加载�?

### Q: 评论功能显示"未启�?�?

A: 需要先配置 Giscus，参考上�?配置评论系统"部分�?

## 技术栈

| 功能 | 技术方�?|
|------|---------|
| 前端框架 | 原生 JavaScript（无框架依赖�?|
| 路由 | Hash-based 路由 |
| Markdown 解析 | marked.js |
| 代码高亮 | highlight.js |
| 评论系统 | Giscus |
| 页面切换 | CSS transition + JavaScript |

## 许可�?

MIT License

## 联系方式

如有问题或建议，欢迎通过评论区或 GitHub Issues 联系�?




