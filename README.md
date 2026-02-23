# 涓汉鍗氬 - Personal Blog

涓€涓熀浜?GitHub Pages 鐨勯潤鎬佸崥瀹㈢郴缁燂紝鍏锋湁缇庤鐨勬杩庨〉鍜屽畬鏁寸殑鍗氬鍔熻兘銆?

## 鍔熻兘鐗规€?

- 馃帹 **绮剧編鐨勬杩庨〉** - 甯︽湁娓愬彉鑳屾櫙銆佺矑瀛愭晥鏋滃拰涓濇粦鍔ㄧ敾
- 馃摑 **鍗氬绯荤粺** - 鏀寔 Markdown 鍜?HTML 鏍煎紡鏂囩珷
- 馃攳 **鎼滅储鍔熻兘** - 鏀寔鏍囬銆佹弿杩般€佹爣绛剧殑妯＄硦鎼滅储
- 馃搳 **鎺掑簭鍔熻兘** - 鎸夊瓧姣嶆垨鏃堕棿鎺掑簭
- 馃捇 **浠ｇ爜楂樹寒** - 鏀寔澶氱缂栫▼璇█鐨勪唬鐮侀珮浜?
- 馃搼 **鐩綍瀵艰埅** - 鑷姩鐢熸垚鏂囩珷鐩綍锛屾敮鎸佹粴鍔ㄩ珮浜?
- 馃挰 **璇勮绯荤粺** - 闆嗘垚 Giscus锛堝熀浜?GitHub Discussions锛?
- 馃摫 **鍝嶅簲寮忚璁?* - 鏀寔妗岄潰銆佸钩鏉裤€佹墜鏈?
- 鈿?**鎬ц兘浼樺寲** - 浼樺寲鐨勫姩鐢诲惊鐜拰鍐呭瓨绠＄悊

## 鏈湴寮€鍙?

鐢变簬娴忚鍣ㄥ畨鍏ㄧ瓥鐣ワ紝鐩存帴鎵撳紑 HTML 鏂囦欢锛坄file://` 鍗忚锛変細闃绘鍔犺浇鏈湴 JSON 鏂囦欢銆傞渶瑕佷娇鐢ㄦ湰鍦版湇鍔″櫒銆?

### 鏂规硶涓€锛氫娇鐢?Python锛堟帹鑽愶級

濡傛灉浣犲凡瀹夎 Python 3锛?

```bash
# 鍦ㄩ」鐩牴鐩綍涓嬫墽琛?
python -m http.server 8000
```

鐒跺悗鍦ㄦ祻瑙堝櫒涓闂細`http://localhost:8000/welcome_page.html`

### 鏂规硶浜岋細浣跨敤 Node.js

濡傛灉浣犲凡瀹夎 Node.js锛?

```bash
# 瀹夎 http-server锛堝彧闇€瀹夎涓€娆★級
npm install -g http-server

# 鍦ㄩ」鐩牴鐩綍涓嬫墽琛?
http-server -p 8000
```

鐒跺悗鍦ㄦ祻瑙堝櫒涓闂細`http://localhost:8000/welcome_page.html`

### 鏂规硶涓夛細浣跨敤 VS Code Live Server

濡傛灉浣犱娇鐢?VS Code锛?

1. 瀹夎 "Live Server" 鎵╁睍
2. 鍙抽敭鐐瑰嚮 `welcome_page.html`
3. 閫夋嫨 "Open with Live Server"

## 娣诲姞鏂囩珷

### 1. 鍒涘缓鏂囩珷鏂囦欢

鍦?`articles` 鏂囦欢澶逛腑鍒涘缓鏂扮殑 Markdown 鎴?HTML 鏂囦欢銆?

**绀轰緥锛坢y-article.md锛夛細**

```markdown
# 鏂囩珷鏍囬

鏂囩珷鎽樿鎴栫畝浠?..

## 绗竴閮ㄥ垎

姝ｆ枃鍐呭...

## 绗簩閮ㄥ垎

鏇村鍐呭...

### 浠ｇ爜绀轰緥

```javascript
function hello() {
    console.log('Hello, World!');
}
```
```

### 2. 提交到 GitHub

```bash
# 只需要提交文章文件
git add articles/my-article.md
git commit -m "Add new article: my-article"
git push origin main
```

### 3. 鎻愪氦鍒?GitHub

```bash
git add articles/my-article.md
git commit -m "Add new article: my-article"
git push origin main
```

## 閰嶇疆璇勮绯荤粺

鏈崥瀹娇鐢?Giscus 璇勮绯荤粺锛屽熀浜?GitHub Discussions銆?

### 閰嶇疆姝ラ

1. 璁块棶 [Giscus 瀹樼綉](https://giscus.app/)
2. 鎸夌収鎻愮ず閰嶇疆锛?
   - 杈撳叆浣犵殑 GitHub 浠撳簱锛堝锛歚SweerItTer/SweerItTer.github.io`锛?
   - 閫夋嫨 Discussions 鍒嗙被
   - 閫夋嫨璇█鍜屼富棰?
3. 澶嶅埗鐢熸垚鐨勯厤缃弬鏁?
4. 缂栬緫 `scripts/article.js`锛屾壘鍒?`addComments()` 鍑芥暟
5. 鏇存柊浠ヤ笅鍙傛暟锛?

```javascript
const giscusConfig = {
    repo: '浣犵殑鐢ㄦ埛鍚?浣犵殑浠撳簱鍚?,     // 渚嬪锛歋weerItTer/SweerItTer.github.io
    repoId: '浠?Giscus 鑾峰彇鐨勪粨搴?ID',
    category: '閫夋嫨鐨勫垎绫诲悕绉?,
    categoryId: '浠?Giscus 鑾峰彇鐨勫垎绫?ID'
};
```

### 娉ㄦ剰浜嬮」

- 浠撳簱蹇呴』鏄叕寮€鐨?
- 闇€瑕佸厛鍦?GitHub 浠撳簱涓惎鐢?Discussions 鍔熻兘
- 璁垮闇€瑕佹湁 GitHub 璐﹀彿鎵嶈兘璇勮

## 文件结构

```
SweerItTer.github.io/
├── articles/              # 文章文件夹（GitHub API 自动识别）
│   └── hello-world.md     # 示例文章
├── scripts/               # JavaScript 脚本
│   ├── core/
│   ├── features/
│   └── ui/
├── styles/                # 样式文件
│   ├── main.css
│   ├── base.css
│   ├── layout.css
│   ├── theme-github.css
│   └── theme-claude.css
├── config/
│   └── site-config.js
├── welcome_page.html
└── README.md
```

## 自定义样式

涓昏鏍峰紡鏂囦欢锛歚styles/main.css`

### 淇敼棰滆壊涓婚

鎵惧埌浠ヤ笅鍙橀噺骞朵慨鏀癸細

```css
/* 涓昏壊璋?*/
--primary-color: #667eea;  /* 绱壊 */

/* 杈呭姪鑹?*/
--secondary-color: #f093fb;  /* 绮夎壊 */

/* 鑳屾櫙鑹?*/
--bg-color: #0a0a0a;  /* 娣遍粦鑹?*/
```

## 鎬ц兘浼樺寲

鏈崥瀹㈠凡杩涜澶氶」鎬ц兘浼樺寲锛?

- **鍚堝苟鍔ㄧ敾寰幆** - 灏嗗涓?`requestAnimationFrame` 寰幆鍚堝苟
- **瀵硅薄姹犳ā寮?* - 绮掑瓙鍏冪礌澶嶇敤锛屽噺灏?DOM 鎿嶄綔
- **浜嬩欢鑺傛祦** - 瀵?`mousemove` 鍜?`resize` 浜嬩欢杩涜鑺傛祦
- **CSS 鍔ㄧ敾** - 浣跨敤 CSS 鍔ㄧ敾鏇夸唬閮ㄥ垎 JavaScript 鍔ㄧ敾
- **鎳掑姞杞?* - 鍗氬鍐呭鍙湪闇€瑕佹椂鍔犺浇

## 浠ｇ爜楂樹寒鏀寔

鏀寔浠ヤ笅缂栫▼璇█锛?

- JavaScript / TypeScript
- Python
- Java
- C/C++
- HTML / CSS
- JSON
- Bash
- SQL

濡傞渶娣诲姞鏇村璇█鏀寔锛岀紪杈?`scripts/article.js` 鐨?`initCodeHighlight()` 鍑芥暟銆?

## 閮ㄧ讲鍒?GitHub Pages

1. 灏嗕唬鐮佹帹閫佸埌 GitHub 浠撳簱鐨?`main` 鍒嗘敮
2. 璁块棶浠撳簱鐨?Settings 鈫?Pages
3. 纭繚 Source 璁剧疆涓?`Deploy from a branch`锛屽垎鏀负 `main`
4. 鍑犲垎閽熷悗璁块棶锛歚https://浣犵殑鐢ㄦ埛鍚?github.io/`

## 甯歌闂

### Q: 鏂囩珷涓嶆樉绀猴紵

## Theme and Analytics (Added 2026-02-23)
- Theme switcher: Article header includes a theme dropdown (GitHub / Claude).
- Giscus comments: Configure repoId/categoryId in `config/site-config.js`.
- Analytics: busuanzi enabled by default (display locked per session on the same article).
- Structure: ES Modules under `scripts/`, themes in `styles/`.

A: 妫€鏌ヤ互涓嬪嚑鐐癸細
- 鏂囦欢鏄惁鍦?`articles` 鏂囦欢澶逛腑
- `` 涓槸鍚︽纭厤缃簡鏂囩珷淇℃伅
- 鏂囦欢鍚嶆槸鍚︿笌閰嶇疆涓殑 `file` 瀛楁鍖归厤
- 鏈湴寮€鍙戞椂鏄惁浣跨敤浜嗘湰鍦版湇鍔″櫒

### Q: 鎼滅储涓嶅伐浣滐紵

A: 鍒锋柊椤甸潰閲嶈瘯锛屾垨妫€鏌ユ祻瑙堝櫒鎺у埗鍙版槸鍚︽湁閿欒銆?

### Q: 浠ｇ爜涓嶉珮浜紵

A: 妫€鏌ョ綉缁滆繛鎺ワ紝浠ｇ爜楂樹寒搴撲粠 CDN 鍔犺浇銆?

### Q: 璇勮鍔熻兘鏄剧ず"鏈惎鐢?锛?

A: 闇€瑕佸厛閰嶇疆 Giscus锛屽弬鑰冧笂鏂?閰嶇疆璇勮绯荤粺"閮ㄥ垎銆?

## 鎶€鏈爤

| 鍔熻兘 | 鎶€鏈柟妗?|
|------|---------|
| 鍓嶇妗嗘灦 | 鍘熺敓 JavaScript锛堟棤妗嗘灦渚濊禆锛?|
| 璺敱 | Hash-based 璺敱 |
| Markdown 瑙ｆ瀽 | marked.js |
| 浠ｇ爜楂樹寒 | highlight.js |
| 璇勮绯荤粺 | Giscus |
| 椤甸潰鍒囨崲 | CSS transition + JavaScript |

## 璁稿彲璇?

MIT License

## 鑱旂郴鏂瑰紡

濡傛湁闂鎴栧缓璁紝娆㈣繋閫氳繃璇勮鍖烘垨 GitHub Issues 鑱旂郴銆?



