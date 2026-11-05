# 吴周杨 · 个人作品集

基于 React + Vite 的室内设计师个人作品集首版。

## 启动

系统已自带便携版 Node.js，可直接运行：

```powershell
.\start.ps1
```

浏览器打开终端中显示的本地地址，默认是 `http://localhost:5173`。

如果本机已经安装了 Node.js，也可以使用：

```powershell
npm install
npm run dev
```

## 主要修改位置

- 页面文案与页面结构：`src/App.jsx`
- 首页视频和下方媒体轮播：`src/config/site.js`
- 色彩、版式与动效：`src/styles.css`
- 人物、项目图片、二维码和首页视频：`public/assets`

## 配置首页媒体

在 `src/config/site.js` 中调整首页媒体，无需修改组件代码：

- `heroPortrait.src`：首页蓝色品牌封面人物
- `aboutPortrait.src`：关于区默认人物肖像
- `showcase.items`：首页下方双行轮播的图片或视频列表
- `showcase.label`、`showcase.caption`：轮播标题与年份说明
- `showcase.scrollSpeed`：滚动随动速度，默认 `0.3`

轮播项默认使用图片：

```js
{ type: 'image', src: '/assets/project-wood.jpg', alt: '项目说明' }
```

也可以替换成自动静音循环的视频：

```js
{
  type: 'video',
  src: '/assets/portfolio-reel.mp4',
  poster: '/assets/hero-poster.jpg',
  alt: '项目视频说明',
}
```

把媒体文件放入 `public/assets`，并在配置中使用对应路径即可。

首页轮播也可以直接在页面中编辑：点击轮播标题右侧的「编辑轮播」，即可上传图片或视频、删除媒体、调整顺序，或恢复 `site.js` 中的默认媒体。自定义媒体会自动保存在当前浏览器的 IndexedDB 中，刷新页面后仍然保留。

## 上传作品

进入页面后滚动到「PROJECT / 空间作品」，可以直接把作品图片拖入上传区，或点击「上传我的作品」。没有作品时首页会显示专门的上传入口，不再展示占位项目。

选图后填写项目名称、分类、年份、面积和说明，即可加入作品集。上传面板中还支持批量添加图片、编辑项目信息、调整顺序或删除作品。

作品卡会完整显示上传图片，不会因比例不同而裁切。任意图片都可以点击进入大图模式，支持左右方向键、ESC 关闭和缩略图跳转。

图片会先压缩，再通过 IndexedDB 保存在当前浏览器中。刷新页面不会丢失；但它属于本地预览数据，不会自动同步给其他设备或线上访客。正式部署时如需多人访问同一作品库，需要再接入对象存储和后端接口。

当前已上传的正式内容已经固化到 `public/content` 和 `src/content/generatedContent.js`，部署后所有访客都可以直接浏览。

如果后续在本地继续上传新作品，需要在页面打开 `?export=1`，点击「下载部署快照」，然后运行：

```powershell
node scripts/ingest-snapshot.mjs "下载文件路径"
npm run build
```

## 互动人物肖像

首页封面与关于区人物使用 `public/assets/portrait-brand.jpg`：

- 人物肖像根据鼠标位置产生 3D 倾斜、位移和光晕跟随
- 关于区保留跟随准星与动态光影
- 关于区可点击「更换照片」上传新肖像，也可以恢复默认图片
- 开启系统「减少动态效果」后，会停止跟随倾斜和装饰动画

## 简洁光标

桌面端使用简洁的自定义光标：中心圆点即时跟随，外围细描边轻微缓动，悬停链接和按钮时只做小幅放大。触屏设备或开启「减少动态效果」时会自动使用系统光标。
