import { useCallback, useEffect, useRef, useState } from 'react'
import { getSetting, putSetting, removeSetting } from '../lib/portfolioDb'
import { optimizeImage } from '../lib/media'

const PORTRAIT_SETTING_ID = 'about-portrait'

export function useAboutPortrait(defaultSrc) {
  const [src, setSrc] = useState(defaultSrc)
  const [isCustomized, setIsCustomized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const objectUrl = useRef('')

  const releaseObjectUrl = useCallback(() => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = ''
  }, [])

  const useRecord = useCallback(
    (record) => {
      releaseObjectUrl()
      if (!record?.blob) {
        setSrc(defaultSrc)
        setIsCustomized(false)
        return
      }

      const nextUrl = URL.createObjectURL(record.blob)
      objectUrl.current = nextUrl
      setSrc(nextUrl)
      setIsCustomized(true)
    },
    [defaultSrc, releaseObjectUrl],
  )

  useEffect(() => {
    let cancelled = false
    getSetting(PORTRAIT_SETTING_ID)
      .then((record) => {
        if (!cancelled) useRecord(record)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || '人物照片加载失败。')
      })

    return () => {
      cancelled = true
      releaseObjectUrl()
    }
  }, [releaseObjectUrl, useRecord])

  const uploadPortrait = useCallback(
    async (file) => {
      if (!file?.type?.startsWith('image/')) {
        throw new Error('请选择 JPG、PNG 或 WebP 图片。')
      }

      setSaving(true)
      setError('')
      try {
        const blob = await optimizeImage(file)
        const record = {
          id: PORTRAIT_SETTING_ID,
          blob,
          fileName: file.name,
          updatedAt: Date.now(),
        }
        await putSetting(record)
        useRecord(record)
      } catch (uploadError) {
        setError(uploadError.message || '人物照片保存失败，请重试。')
        throw uploadError
      } finally {
        setSaving(false)
      }
    },
    [useRecord],
  )

  const resetPortrait = useCallback(async () => {
    setSaving(true)
    setError('')
    try {
      await removeSetting(PORTRAIT_SETTING_ID)
      useRecord(null)
    } catch (resetError) {
      setError(resetError.message || '恢复默认照片失败，请重试。')
      throw resetError
    } finally {
      setSaving(false)
    }
  }, [useRecord])

  return {
    src,
    isCustomized,
    saving,
    error,
    uploadPortrait,
    resetPortrait,
  }
}
