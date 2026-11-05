import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllProjects, putProject, removeProject } from '../lib/portfolioDb'
import { createRecordId, optimizeImage } from '../lib/media'

export function usePortfolioLibrary() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const objectUrls = useRef([])

  const hydrate = useCallback((records) => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.current = []

    return records.map((record) => {
      const imageUrls = record.images.map((blob) => {
        const url = URL.createObjectURL(blob)
        objectUrls.current.push(url)
        return url
      })

      return { ...record, imageUrls }
    })
  }, [])

  const refresh = useCallback(async () => {
    const records = await getAllProjects()
    setProjects(hydrate(records))
  }, [hydrate])

  useEffect(() => {
    let cancelled = false

    getAllProjects()
      .then((records) => {
        if (!cancelled) setProjects(hydrate(records))
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || '本地作品库加载失败。')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [hydrate])

  const createProject = useCallback(
    async ({ title, category, year, area, description, files }) => {
      if (!title.trim()) throw new Error('请填写项目名称。')
      if (!files.length) throw new Error('请至少选择一张作品图片。')

      setSaving(true)
      setError('')
      try {
        const images = await Promise.all(files.map(optimizeImage))
        const existing = await getAllProjects()
        const project = {
          id: createRecordId('project'),
          title: title.trim(),
          category: category.trim() || '空间设计',
          year: year.trim() || String(new Date().getFullYear()),
          area: area.trim() || '项目实践',
          description: description.trim(),
          images,
          order: existing.length,
          createdAt: Date.now(),
        }
        await putProject(project)
        await refresh()
        return project.id
      } catch (createError) {
        setError(createError.message || '作品保存失败，请重试。')
        throw createError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const updateProject = useCallback(
    async (id, patch) => {
      setSaving(true)
      setError('')
      try {
        const existing = await getAllProjects()
        const project = existing.find((item) => item.id === id)
        if (!project) throw new Error('没有找到这个作品。')
        await putProject({ ...project, ...patch })
        await refresh()
      } catch (updateError) {
        setError(updateError.message || '作品更新失败，请重试。')
        throw updateError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const deleteProject = useCallback(
    async (id) => {
      setSaving(true)
      setError('')
      try {
        await removeProject(id)
        await refresh()
      } catch (deleteError) {
        setError(deleteError.message || '作品删除失败，请重试。')
        throw deleteError
      } finally {
        setSaving(false)
      }
    },
    [refresh],
  )

  const moveProject = useCallback(
    async (id, direction) => {
      const ordered = await getAllProjects()
      const index = ordered.findIndex((project) => project.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= ordered.length) return

      const current = ordered[index]
      const sibling = ordered[target]
      await putProject({ ...current, order: sibling.order })
      await putProject({ ...sibling, order: current.order })
      await refresh()
    },
    [refresh],
  )

  return {
    projects,
    loading,
    saving,
    error,
    createProject,
    updateProject,
    deleteProject,
    moveProject,
  }
}
