import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '../config/site'

function LivingPortrait({
  src,
  isCustomized = false,
  saving = false,
  error = '',
  onUploadPhoto,
  onResetPhoto,
}) {
  const portraitRef = useRef(null)
  const inputRef = useRef(null)
  const animationFrame = useRef(0)
  const latestPointer = useRef({ x: 0, y: 0 })
  const message = '移动鼠标，光影会跟随你的方向。'
  const [reducedMotion, setReducedMotion] = useState(false)
  const portraitSrc = src || siteConfig.aboutPortrait.src

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(preference.matches)
    syncPreference()
    preference.addEventListener('change', syncPreference)
    return () => preference.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    const portrait = portraitRef.current
    if (!portrait || reducedMotion) return undefined

    const renderPointer = () => {
      const { x, y } = latestPointer.current
      portrait.style.setProperty('--portrait-look-x', `${(x * 9).toFixed(2)}deg`)
      portrait.style.setProperty('--portrait-look-y', `${(-y * 7).toFixed(2)}deg`)
      portrait.style.setProperty('--portrait-shift-x', `${(x * 14).toFixed(2)}px`)
      portrait.style.setProperty('--portrait-shift-y', `${(y * 9).toFixed(2)}px`)
      portrait.style.setProperty('--portrait-light-x', `${(50 + x * 22).toFixed(2)}%`)
      portrait.style.setProperty('--portrait-light-y', `${(42 + y * 20).toFixed(2)}%`)
    }

    const handlePointerMove = (event) => {
      const rect = portrait.getBoundingClientRect()
      const reachX = Math.max(260, rect.width * 0.9)
      const reachY = Math.max(260, rect.height * 0.9)
      latestPointer.current = {
        x: Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / reachX)),
        y: Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height * 0.42)) / reachY)),
      }
      portrait.classList.add('is-tracking')
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = requestAnimationFrame(renderPointer)
    }

    const resetPointer = () => {
      latestPointer.current = { x: 0, y: 0 }
      portrait.classList.remove('is-tracking')
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = requestAnimationFrame(renderPointer)
    }

    renderPointer()
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetPointer)
    return () => {
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetPointer)
    }
  }, [reducedMotion])

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !onUploadPhoto) return
    try {
      await onUploadPhoto(file)
    } catch {
      // The hook exposes the user-facing error below the portrait.
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className="living-portrait living-portrait--video living-portrait--photo"
      ref={portraitRef}
    >
      <div className="portrait-speech" aria-live="polite">
        <span>{message}</span>
      </div>

      <span className="portrait-orbit portrait-orbit--one" aria-hidden="true" />
      <span className="portrait-orbit portrait-orbit--two" aria-hidden="true" />
      <span className="portrait-spark portrait-spark--one" aria-hidden="true">+</span>
      <span className="portrait-spark portrait-spark--two" aria-hidden="true">+</span>

      <div
        className="portrait-video-frame"
        role="img"
        aria-label="吴周杨人物肖像"
      >
        <span className="portrait-pointer-light" aria-hidden="true" />
        <span className="portrait-pointer-ring" aria-hidden="true" />
        <img
          className="portrait-character-video portrait-character-photo"
          src={portraitSrc}
          alt="吴周杨人物肖像"
        />
        <span className="portrait-video-shade" aria-hidden="true" />
        <span className="portrait-follow-label" aria-hidden="true">
          <i />
          MOVE CURSOR / 跟随鼠标
        </span>
        <span className="portrait-play-state" aria-hidden="true">
          PORTRAIT / 01
        </span>
      </div>

      <div className="portrait-photo-controls">
        <label className={saving ? 'is-saving' : ''}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={saving}
          />
          {saving ? '保存中…' : '更换照片'}
        </label>
        {isCustomized && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (window.confirm('确定恢复默认人物照片吗？')) {
                onResetPhoto?.().catch(() => {})
              }
            }}
          >
            恢复默认
          </button>
        )}
      </div>
      {error && <p className="portrait-photo-error">{error}</p>}

      <div className="portrait-hint" aria-hidden="true">
        <span />
        移动鼠标 / 光影跟随
      </div>
    </div>
  )
}

export default LivingPortrait
