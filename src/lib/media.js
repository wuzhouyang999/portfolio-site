const MAX_IMAGE_DIMENSION = 3200

export function createRecordId(prefix = 'item') {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function optimizeImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`“${file.name}”不是可识别的图片文件。`)
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
  )
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d', { alpha: false })
  context.fillStyle = '#0c0c0c'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const optimized = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.9)
  })

  return optimized || file
}
