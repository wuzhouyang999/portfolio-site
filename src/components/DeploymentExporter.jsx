import { useState } from 'react'
import { getAllProjects, getAllShowcaseItems, getSetting } from '../lib/portfolioDb'

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        type: blob.type || 'application/octet-stream',
        size: blob.size,
        data: String(reader.result).split(',')[1] || '',
      })
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function compress(value) {
  const source = new Blob([JSON.stringify(value)], { type: 'application/json' })
  if (!window.CompressionStream) return { blob: source, compressed: false }
  const stream = source.stream().pipeThrough(new CompressionStream('gzip'))
  return { blob: new Blob([await new Response(stream).arrayBuffer()]), compressed: true }
}

function DeploymentExporter() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const exportSnapshot = async () => {
    setBusy(true)
    setStatus('正在读取项目与图片…')
    try {
      const [projectRecords, showcaseRecords, portraitRecord] = await Promise.all([
        getAllProjects(),
        getAllShowcaseItems(),
        getSetting('about-portrait'),
      ])

      const projects = []
      for (const project of projectRecords) {
        const images = []
        for (const image of project.images) images.push(await readBlob(image))
        projects.push({ ...project, images })
      }

      const showcase = []
      for (const item of showcaseRecords) {
        showcase.push({ ...item, blob: await readBlob(item.blob) })
      }

      const portrait = portraitRecord
        ? { ...portraitRecord, blob: await readBlob(portraitRecord.blob) }
        : null

      setStatus('正在压缩部署数据…')
      const snapshot = {
        format: 'wzy-portfolio-snapshot',
        version: 1,
        exportedAt: new Date().toISOString(),
        origin: window.location.origin,
        projects,
        showcase,
        portrait,
      }
      const { blob, compressed } = await compress(snapshot)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = compressed
        ? 'wzy-deployment-snapshot.json.gz'
        : 'wzy-deployment-snapshot.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus(
        `已导出 ${projects.length} 个作品、${showcase.length} 个轮播媒体${
          portrait ? '和自定义人物照片' : ''
        }。`,
      )
    } catch (error) {
      setStatus(error.message || '导出失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="deployment-exporter">
      <span>DEPLOYMENT SNAPSHOT</span>
      <h2>保存已上传内容</h2>
      <p>
        从当前浏览器读取作品项目、首页轮播和关于区人物照片，导出为可迁移的部署数据。
      </p>
      <button type="button" onClick={exportSnapshot} disabled={busy}>
        {busy ? '正在生成…' : '下载部署快照'}
      </button>
      {status && <small>{status}</small>}
    </section>
  )
}

export default DeploymentExporter
