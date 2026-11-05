import { useEffect, useRef, useState } from 'react'

const MAX_FILES = 12
const MAX_FILE_SIZE = 25 * 1024 * 1024

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" />
    </svg>
  )
}

function MoveIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={direction < 0 ? 'is-up' : ''}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function PortfolioManager({
  open,
  onClose,
  initialFiles = [],
  uploadSession,
  projects,
  saving,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
}) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadNotice, setUploadNotice] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: '居住空间',
    year: String(new Date().getFullYear()),
    area: '',
    description: '',
  })

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !uploadSession) return
    const incomingFiles = initialFiles.slice(0, MAX_FILES)
    setFiles(incomingFiles)
    setUploadNotice('')

    if (incomingFiles.length) {
      const suggestedTitle = incomingFiles[0].name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
      setForm((current) => ({
        ...current,
        title: current.title.trim() || suggestedTitle,
      }))
    }
  }, [initialFiles, open, uploadSession])

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPreviews(nextPreviews)
    return () => {
      nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url))
    }
  }, [files])

  if (!open) return null

  const addFiles = (incomingFiles) => {
    const candidates = Array.from(incomingFiles)
    const valid = candidates.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE,
    )
    const rejectedCount = candidates.length - valid.length
    const exceedsLimit = files.length + valid.length > MAX_FILES

    setFiles((current) => [...current, ...valid].slice(0, MAX_FILES))
    if (exceedsLimit) {
      setUploadNotice(`每个项目最多保留 ${MAX_FILES} 张图片。`)
    } else if (rejectedCount) {
      setUploadNotice(`${rejectedCount} 个文件格式不支持或超过 25MB。`)
    } else {
      setUploadNotice('')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      await onCreate({ ...form, files })
      setForm((current) => ({
        ...current,
        title: '',
        area: '',
        description: '',
      }))
      setFiles([])
      setUploadNotice('')
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      // The hook exposes the user-facing error beside the upload form.
    }
  }

  return (
    <div className="portfolio-manager" role="dialog" aria-modal="true" aria-label="作品管理">
      <button className="portfolio-manager-backdrop" onClick={onClose} aria-label="关闭作品管理" />
      <div className="portfolio-manager-panel">
        <header className="manager-header">
          <div>
            <span>LOCAL GALLERY / 作品管理</span>
            <h2>上传你的作品</h2>
          </div>
          <button className="manager-close" type="button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </header>

        <div className="manager-scroll">
          <form className="upload-form" onSubmit={submit}>
            <div
              className={`upload-dropzone ${dragActive ? 'is-dragging' : ''}`}
              onDragEnter={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragActive(false)
                addFiles(event.dataTransfer.files)
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => addFiles(event.target.files)}
              />
              <span className="upload-plus">+</span>
              <strong>拖入作品图片，或点击选择</strong>
              <small>支持 JPG / PNG / WebP，单张不超过 25MB，最多 12 张</small>
            </div>

            {previews.length > 0 && (
              <div className="upload-previews">
                {previews.map(({ file, url }, index) => (
                  <figure key={`${file.name}-${file.lastModified}-${index}`}>
                    <img src={url} alt={`待上传图片 ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      aria-label={`移除 ${file.name}`}
                    >
                      <CloseIcon />
                    </button>
                  </figure>
                ))}
              </div>
            )}

            {uploadNotice && <p className="upload-notice">{uploadNotice}</p>}

            <div className="upload-fields">
              <label>
                <span>项目名称</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="例如：木影"
                  required
                />
              </label>
              <label>
                <span>项目分类</span>
                <input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="居住空间 / 商业空间"
                />
              </label>
              <label>
                <span>项目年份</span>
                <input
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: event.target.value })}
                  inputMode="numeric"
                />
              </label>
              <label>
                <span>面积或类型</span>
                <input
                  value={form.area}
                  onChange={(event) => setForm({ ...form, area: event.target.value })}
                  placeholder="168㎡ / 全案设计"
                />
              </label>
            </div>

            <label className="upload-description">
              <span>项目说明</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="简单描述空间概念、材质或设计策略。"
                rows="3"
              />
            </label>

            {error && <p className="manager-error">{error}</p>}

            <div className="upload-actions">
              <p>图片会压缩后保存在当前浏览器中，不会上传到外部服务器。</p>
              <button className="manager-primary" type="submit" disabled={saving}>
                {saving ? '正在保存…' : '加入作品集'}
              </button>
            </div>
          </form>

          <section className="managed-projects">
            <div className="managed-projects-heading">
              <h3>已上传作品</h3>
              <span>{String(projects.length).padStart(2, '0')} PROJECTS</span>
            </div>

            {projects.length === 0 ? (
              <div className="manager-empty">
                <span>还没有上传作品</span>
                <p>你的图片和项目信息会保留在这台设备的当前浏览器中。</p>
              </div>
            ) : (
              <div className="managed-list">
                {projects.map((project, index) => (
                  <article className="managed-item" key={project.id}>
                    <img src={project.imageUrls[0]} alt="" />
                    <div className="managed-fields">
                      <label>
                        <span>项目名称</span>
                        <input
                          defaultValue={project.title}
                          onBlur={(event) => {
                            const title = event.target.value.trim()
                            if (title && title !== project.title) {
                              onUpdate(project.id, { title }).catch(() => {})
                            }
                          }}
                        />
                      </label>
                      <label>
                        <span>分类</span>
                        <input
                          defaultValue={project.category}
                          onBlur={(event) => {
                            const category = event.target.value.trim()
                            if (category && category !== project.category) {
                              onUpdate(project.id, { category }).catch(() => {})
                            }
                          }}
                        />
                      </label>
                      <small>
                        {project.images.length} 张图片 · {project.year} · {project.area}
                      </small>
                    </div>
                    <div className="managed-actions">
                      <button
                        type="button"
                        onClick={() => onMove(project.id, -1).catch(() => {})}
                        disabled={index === 0 || saving}
                        aria-label="向前移动"
                      >
                        <MoveIcon direction={-1} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(project.id, 1).catch(() => {})}
                        disabled={index === projects.length - 1 || saving}
                        aria-label="向后移动"
                      >
                        <MoveIcon direction={1} />
                      </button>
                      <button
                        className="delete-project"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`确定删除“${project.title}”吗？`)) {
                            onDelete(project.id).catch(() => {})
                          }
                        }}
                        disabled={saving}
                        aria-label="删除项目"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default PortfolioManager
