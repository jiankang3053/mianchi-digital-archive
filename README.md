# 渑池数字策展 / Mianchi Digital Archive

一个以河南省三门峡市渑池县为主题的家乡宣传交互网站。项目将仰韶文化、黄河丹峡、城市烟火与现代网页动效融合成一个可浏览、可演示、可部署的静态门户网站。

## 项目亮点

- 强开屏视觉：使用大幅本地视觉资产、标题动效和分层背景营造第一屏冲击力。
- 滚动叙事：结合 Locomotive Scroll/Lenis 风格的平滑滚动、视差、飞入、旋转、缩放与联动动画。
- 多页面门户：主页与文化、旅行、生活、策展页面统一风格，导航互通。
- 多媒体展示：包含图片、SVG 图形、音频、视频、表单与专题入口。
- 静态部署友好：无需后端和构建步骤，可直接部署到 Vercel、GitHub Pages 或任意静态托管平台。

## 页面结构

- `index.html`：首页，包含开屏动画、滚动叙事、3D 视觉、多媒体展示和门户入口。
- `webs/culture.html`：仰韶文化专题。
- `webs/travel.html`：黄河丹峡与旅游路线。
- `webs/life.html`：城市生活、音视频与留言表单。
- `design-board.html`：数字策展页面，呈现主题、色彩、动效与页面结构。
- `sources.md`：素材与参考来源记录。

## 技术栈

- HTML5
- CSS3
- JavaScript
- Locomotive Scroll 风格滚动体验
- Lenis 平滑滚动
- 原生 CSS 动画、滚动联动、响应式布局

## 本地预览

在项目根目录运行：

```bash
python -m http.server 5173
```

浏览器打开：

```text
http://localhost:5173
```

## 部署说明

这是一个纯静态网站，不需要构建命令。

### Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目并导入该仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 留空。
5. Output Directory 留空或使用项目根目录。

`vercel.json` 已配置静态站点部署参数。

### GitHub Pages

也可以在仓库 Settings -> Pages 中选择 `main` 分支和根目录进行发布。

## 作者信息

- 班级：网媒23级四班
- 作者：史湘楠
- 主题：河南渑池县家乡宣传网站
