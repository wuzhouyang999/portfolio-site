import { useEffect, useRef, useState } from 'react'

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

function ShowcasePreview({ item }) {
  if (item.type === 'video') {
    return <video src={item.src} muted loop playsInline preload="metadata" />
  }

  return <img src={item.src} alt={item.alt || ''} loading="lazy" />
}

function ShowcaseManager({
  open,
  onClose,
  items,
  isCustomized,
  saving,
  error,
  onAddMedia,
  onDeleteMedia,
  onMoveMedia,
  onResetMedia,
}) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [notice, setNotice] = useState('')

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
    if (open) setNotice('')
  }, [open])

  if (!open) return null

  const addFiles = async (files) => {
    const incoming = Array.from(files)
    if (!incoming.length) return

    setNotice(`正在处理 ${incoming.length} 个媒体文件…`)
    try {
      await onAddMedia(incoming)
      setNotice('已保存，首页轮播已更新。')
    } catch {
      setNotice('')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className="portfolio-manager showcase-manager"
      role="dialog"
      aria-modal="true"
      aria-label="编辑首页轮播"
    >
      <button
        className="portfolio-manager-backdrop"
        type="button"
        onClick={onClose}
        aria-label="关闭首页轮播编辑"
      />
      <div className="portfolio-manager-panel showcase-manager-panel">
        <header className="manager-header">
          <div>
            <span>HOMEPAGE MEDIA / 首页轮播</span>
            <h2>编辑轮播影像</h2>
          </div>
          <button className="manager-close" type="button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </header>

        <div className="manager-scroll showcase-manager-scroll">
          <div className="showcase-editor-intro">
            <p>
              直接上传图片或视频。添加、删除和排序都会自动保存，并同步应用到首页双行轮播。
            </p>
            <span>{String(items.length).padStart(2, '0')} MEDIA</span>
          </div>

          <div
            className={`upload-dropzone showcase-upload-zone ${dragActive ? 'is-dragging' : ''}`}
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
              accept="image/*,video/mp4,video/webm"
              multiple
              onChange={(event) => addFiles(event.target.files)}
            />
            <span className="upload-plus">+</span>
            <strong>{saving ? '正在保存媒体…' : '拖入轮播图片或视频，或点击选择'}</strong>
            <small>图片不超过 30MB，视频不超过 100MB，最多保留 18 个媒体</small>
          </div>

          {notice && <p className="showcase-notice">{notice}</p>}
          {error && <p className="manager-error">{error}</p>}

          <section className="showcase-media-section">
            <div className="managed-projects-heading">
              <h3>{isCustomized ? '当前轮播' : '默认轮播'}</h3>
              <span>{isCustomized ? '自动保存 / 可排序' : 'CONFIG MEDIA'}</span>
            </div>

            <div className="showcase-media-grid">
              {items.map((item, index) => (
                <article className="showcase-media-item" key={item.id}>
                  <figure>
                    <ShowcasePreview item={item} />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <small>{item.type === 'video' ? 'VIDEO' : 'IMAGE'}</small>
                  </figure>
                  {isCustomized && (
                    <div className="showcase-media-actions">
                      <button
                        type="button"
                        onClick={() => onMoveMedia(item.id, -1).catch(() => {})}
                        disabled={index === 0 || saving}
                        aria-label="向前移动"
                      >
                        <MoveIcon direction={-1} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveMedia(item.id, 1).catch(() => {})}
                        disabled={index === items.length - 1 || saving}
                        aria-label="向后移动"
                      >
                        <MoveIcon direction={1} />
                      </button>
                      <button
                        className="delete-project"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`确定从首页轮播中删除第 ${index + 1} 个媒体吗？`)) {
                            onDeleteMedia(item.id).catch(() => {})
                          }
                        }}
                        disabled={saving}
                        aria-label="删除媒体"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <footer className="showcase-editor-footer">
            <p>
              {isCustomized
                ? '自定义媒体保存在当前浏览器中。删除全部媒体后会恢复配置文件中的默认轮播。'
                : '当前使用 src/config/site.js 中的默认媒体，添加任意媒体后会切换为自定义轮播。'}
            </p>
            {isCustomized && (
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (window.confirm('确定恢复为配置文件中的默认轮播吗？')) {
                    onResetMedia().catch(() => {})
                  }
                }}
              >
                恢复默认轮播
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}

export default ShowcaseManager
