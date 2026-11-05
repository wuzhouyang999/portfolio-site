import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearShowcaseItems,
  getAllShowcaseItems,
  putShowcaseItems,
  removeShowcaseItem,
} from '../lib/portfolioDb'
import { createRecordId, optimizeImage } from '../lib/media'

const MAX_SHOWCASE_ITEMS = 18
const MAX_IMAGE_SIZE = 30 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

function defaultsFromConfig(fallbackItems) {
  return fallbackItems.map((item, index) => ({
    ...item,
    id: `default-showcase-${index}`,
    isDefault: true,
  }))
}

export function useShowcaseLibrary(fallbackItems) {
  const [items, setItems] = useState(() => defaultsFromConfig(fallbackItems))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCustomized, setIsCustomized] = useState(false)
  const [error, setError] = useState('')
  const objectUrls = useRef([])

  const hydrate = useCallback((records) => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.current = []

    return records.map((record) => {
      const src = URL.createObjectURL(record.blob)
      objectUrls.current.push(src)
      return {
        ...record,
        src,
        alt: record.alt || record.fileName || '',
        isDefault: false,
      }
    })
  }, [])

  const refresh = useCallback(
    async () => {
      const records = await getAllShowcaseItems()
      const customized = records.length > 0
      setIsCustomized(customized)
      setItems(customized ? hydrate(records) : defaultsFromConfig(fallbackItems))
    },
    [fallbackItems, hydrate],
  )

  useEffect(() => {
    let cancelled = false

    getAllShowcaseItems()
      .then((records) => {
        if (cancelled) return
        const customized = records.length > 0
        setIsCustomized(customized)
        setItems(customized ? hydrate(records) : defaultsFromConfig(fallbackItems))
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || '首页轮播媒体加载失败。')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [fallbackItems, hydrate])

  const addMedia = useCallback(
    async (incomingFiles) => {
      const candidates = Array.from(incomingFiles)
      const valid = candidates.filter((file) => {
        if (file.type.startsWith('image/')) return file.size <= MAX_IMAGE_SIZE
        if (file.type.startsWith('video/')) return file.size <= MAX_VIDEO_SIZE
        return false
      })

      if (!valid.length) {
        throw new Error('请选择 JPG、PNG、WebP 图片或 MP4、WebM 视频。')
      }

      setSaving(true)
      setError('')
      try {
        const existing = await getAllShowcaseItems()
        const available = Math.max(0, MAX_SHOWCASE_ITEMS - existing.length)
        if (!available) {
          throw new Error(`首页轮播最多保留 ${MAX_SHOWCASE_ITEMS} 个媒体。`)
        }

        const selected = valid.slice(0, available)
        const records = await Promise.all(
          selected.map(async (file, index) => {
            const isImage = file.type.startsWith('image/')
            const blob = isImage ? await optimizeImage(file) : file
            return {
              id: createRecordId('showcase'),
              blob,
              type: isImage ? 'image' : 'video',
              mimeType: blob.type || file.type,
              fileName: file.name,
              alt: file.name.replace(/\.[^.]+$/, ''),
              order: existing.length + index,
              createdAt: Date.now() + index,
            }
          }),
        )

        await putShowcaseItems(records)
        await refresh()
      } catch (addError) {
        setError(addError.message || '轮播媒体保存失败，请重试。')
        throw addError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const deleteMedia = useCallback(
    async (id) => {
      setSaving(true)
      setError('')
      try {
        await removeShowcaseItem(id)
        await refresh()
      } catch (deleteError) {
        setError(deleteError.message || '轮播媒体删除失败，请重试。')
        throw deleteError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const moveMedia = useCallback(
    async (id, direction) => {
      setSaving(true)
      setError('')
      try {
        const ordered = await getAllShowcaseItems()
        const index = ordered.findIndex((item) => item.id === id)
        const targetIndex = index + direction
        if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return

        const current = ordered[index]
        const sibling = ordered[targetIndex]
        await putShowcaseItems([
          { ...current, order: sibling.order },
          { ...sibling, order: current.order },
        ])
        await refresh()
      } catch (moveError) {
        setError(moveError.message || '轮播排序保存失败，请重试。')
        throw moveError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const resetMedia = useCallback(async () => {
    setSaving(true)
    setError('')
    try {
      await clearShowcaseItems()
      await refresh()
    } catch (resetError) {
      setError(resetError.message || '恢复默认轮播失败，请重试。')
      throw resetError
    } finally {
      setSaving(false)
    }
  }, [refresh])

  return {
    items,
    loading,
    saving,
    isCustomized,
    error,
    addMedia,
    deleteMedia,
    moveMedia,
    resetMedia,
  }
}
