import { useEffect, useRef } from 'react'

function ArrowIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={direction === 'prev' ? 'is-prev' : ''}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function ImageLightbox({ gallery, onClose, onChange }) {
  const closeRef = useRef(null)
  const images = gallery?.images || []
  const currentIndex = gallery?.index || 0
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (!gallery) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasMultiple) {
        onChange((currentIndex - 1 + images.length) % images.length)
      }
      if (event.key === 'ArrowRight' && hasMultiple) {
        onChange((currentIndex + 1) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, gallery, hasMultiple, images.length, onChange, onClose])

  if (!gallery || !images.length) return null

  const move = (direction) => {
    onChange((currentIndex + direction + images.length) % images.length)
  }

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`${gallery.title} 图片预览`}>
      <button
        className="image-lightbox-backdrop"
        type="button"
        onClick={onClose}
        aria-label="关闭图片预览"
      />

      <div className="image-lightbox-shell">
        <header className="image-lightbox-header">
          <div>
            <span>PROJECT VIEW / 项目图片</span>
            <strong>{gallery.title}</strong>
          </div>
          <div className="image-lightbox-counter">
            <span>{String(currentIndex + 1).padStart(2, '0')}</span>
            <i />
            <span>{String(images.length).padStart(2, '0')}</span>
          </div>
          <button
            ref={closeRef}
            className="image-lightbox-close"
            type="button"
            onClick={onClose}
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="image-lightbox-stage">
          {hasMultiple && (
            <button
              className="image-lightbox-nav is-prev"
              type="button"
              onClick={() => move(-1)}
              aria-label="上一张"
            >
              <ArrowIcon direction="prev" />
            </button>
          )}
          <div className="image-lightbox-image">
            <img
              key={images[currentIndex]}
              src={images[currentIndex]}
              alt={`${gallery.title} 项目图片 ${currentIndex + 1}`}
            />
          </div>
          {hasMultiple && (
            <button
              className="image-lightbox-nav is-next"
              type="button"
              onClick={() => move(1)}
              aria-label="下一张"
            >
              <ArrowIcon direction="next" />
            </button>
          )}
        </div>

        {hasMultiple && (
          <div className="image-lightbox-thumbnails" aria-label="项目图片列表">
            {images.map((image, index) => (
              <button
                className={index === currentIndex ? 'is-active' : ''}
                type="button"
                key={`${image}-${index}`}
                onClick={() => onChange(index)}
                aria-label={`查看第 ${index + 1} 张图片`}
                aria-current={index === currentIndex}
              >
                <img src={image} alt="" />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        )}

        <p className="image-lightbox-help">
          <span>ESC 关闭</span>
          {hasMultiple && <span>← → 切换图片</span>}
        </p>
      </div>
    </div>
  )
}

export default ImageLightbox
