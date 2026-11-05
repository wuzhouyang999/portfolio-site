# 吴周杨作品集部署说明

## 直接部署

上传或解压 `portfolio-site-dist-final-2026-11-05.zip`，将其中全部文件放到网站根目录。

- 入口文件：`index.html`
- 不需要安装 Node.js
- 不需要执行构建命令
- 页面固定内容已经包含在 `content/` 和 `assets/`

适用于 Vercel、Netlify、Cloudflare Pages 的静态文件托管，或普通虚拟主机。

## 使用源码部署

上传 `portfolio-site-source-final-2026-11-05.zip` 解压后，在项目目录运行：

```powershell
npm install
npm run build
```

将生成的 `dist` 目录作为发布目录。

## 内容备份

`portfolio-content-snapshot-2026-11-04.json.gz` 是本次已发布作品、轮播图片和人物照片的原始快照，仅用于备份和后续迁移，不需要上传到公开网站目录。

## 后续更新内容

如果后续在本地页面上传了新作品：

1. 在网站地址末尾追加 `?export=1` 并打开。
2. 点击「下载部署快照」。
3. 在项目目录运行：

```powershell
node scripts/ingest-snapshot.mjs "快照文件路径"
npm run build
```
