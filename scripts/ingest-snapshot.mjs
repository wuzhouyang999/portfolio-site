import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

const workspace = process.cwd()
const snapshotPath = path.resolve(
  process.argv[2] ||
    path.join(process.env.USERPROFILE || '', 'Downloads', 'wzy-deployment-snapshot.json.gz'),
)
const contentRoot = path.join(workspace, 'public', 'content')
const generatedPath = path.join(workspace, 'src', 'content', 'generatedContent.js')
const snapshot = JSON.parse(gunzipSync(fs.readFileSync(snapshotPath)).toString('utf8'))

if (snapshot.format !== 'wzy-portfolio-snapshot' || snapshot.version !== 1) {
  throw new Error('Unsupported deployment snapshot format')
}

const extensionFor = (type = '') => {
  if (type.includes('webp')) return 'webp'
  if (type.includes('png')) return 'png'
  if (type.includes('jpeg')) return 'jpg'
  if (type.includes('mp4')) return 'mp4'
  if (type.includes('webm')) return 'webm'
  return 'bin'
}

const writeBlob = (target, payload) => {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, Buffer.from(payload.data, 'base64'))
}

const projects = snapshot.projects.map((project, projectIndex) => {
  const folderName = String(projectIndex + 1).padStart(2, '0')
  const images = project.images.map((image, imageIndex) => {
    const extension = extensionFor(image.type)
    const fileName = `image-${String(imageIndex + 1).padStart(2, '0')}.${extension}`
    writeBlob(
      path.join(contentRoot, 'projects', folderName, fileName),
      image,
    )
    return `/content/projects/${folderName}/${fileName}`
  })

  return {
    id: project.id,
    title: project.title,
    category: project.category,
    year: project.year,
    area: project.area,
    description: String(project.description || '').replaceAll('**', ''),
    images,
  }
})

const showcase = snapshot.showcase.map((item, index) => {
  const extension = extensionFor(item.blob?.type || item.mimeType)
  const fileName = `${String(index + 1).padStart(2, '0')}.${extension}`
  writeBlob(path.join(contentRoot, 'showcase', fileName), item.blob)
  const type =
    item.type || ((item.blob?.type || '').startsWith('video/') ? 'video' : 'image')
  return {
    type,
    src: `/content/showcase/${fileName}`,
    alt: item.alt || item.fileName || '',
  }
})

let portrait = '/assets/portrait-brand.jpg'
if (snapshot.portrait?.blob) {
  const extension = extensionFor(snapshot.portrait.blob.type)
  portrait = `/content/portrait.${extension}`
  writeBlob(path.join(contentRoot, `portrait.${extension}`), snapshot.portrait.blob)
}

fs.mkdirSync(path.dirname(generatedPath), { recursive: true })
fs.writeFileSync(
  generatedPath,
  `// Generated from the exported deployment snapshot on ${snapshot.exportedAt}.\n` +
    `export const generatedProjects = ${JSON.stringify(projects, null, 2)}\n\n` +
    `export const generatedShowcase = ${JSON.stringify(showcase, null, 2)}\n\n` +
    `export const generatedPortrait = ${JSON.stringify(portrait)}\n`,
)

console.log(
  JSON.stringify({
    projects: projects.length,
    projectImages: projects.reduce((total, project) => total + project.images.length, 0),
    showcase: showcase.length,
    portrait,
  }),
)
