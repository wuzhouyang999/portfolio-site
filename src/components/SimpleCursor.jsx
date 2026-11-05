import { useEffect, useRef } from 'react'

function SimpleCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const dot = dotRef.current
    const ring = ringRef.current
    let frame = 0
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const animate = () => {
      currentX += (targetX - currentX) * 0.22
      currentY += (targetY - currentY) * 0.22
      ring.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
      frame = requestAnimationFrame(animate)
    }

    const move = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      dot.classList.add('is-active')
      ring.classList.add('is-active')
    }

    const hover = (event) => {
      ring.classList.toggle('is-hovering', Boolean(event.target.closest('a, button, label')))
    }

    const leave = () => {
      dot.classList.remove('is-active')
      ring.classList.remove('is-active')
    }

    document.documentElement.classList.add('simple-cursor-active')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', hover)
    document.documentElement.addEventListener('pointerleave', leave)
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('simple-cursor-active')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', hover)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <>
      <span ref={ringRef} className="simple-cursor-ring" aria-hidden="true" />
      <span ref={dotRef} className="simple-cursor-dot" aria-hidden="true" />
    </>
  )
}

export default SimpleCursor
