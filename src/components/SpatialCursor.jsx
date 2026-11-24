import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function SpatialCursor() {
  const rootRef = useRef(null)
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!root || !dot || !ring || !label) return

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' })

    let activeTarget = null
    document.documentElement.classList.add('has-spatial-cursor')

    const handleMove = (event) => {
      if (event.pointerType === 'touch') return
      root.classList.add('is-visible')
      dotX(event.clientX)
      dotY(event.clientY)
      ringX(event.clientX)
      ringY(event.clientY)
    }

    const handleOver = (event) => {
      const target = event.target.closest?.('[data-cursor]')
      if (!target) {
        if (activeTarget) {
          activeTarget = null
          root.classList.remove('has-label')
          label.textContent = ''
        }
        return
      }
      if (target === activeTarget) return
      activeTarget = target
      label.textContent = target.getAttribute('data-cursor') ?? ''
      root.classList.add('has-label')
    }

    const handleLeave = () => root.classList.remove('is-visible')
    const handleDown = () => root.classList.add('is-down')
    const handleUp = () => root.classList.remove('is-down')

    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerover', handleOver, { passive: true })
    window.addEventListener('pointerleave', handleLeave)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)

    return () => {
      document.documentElement.classList.remove('has-spatial-cursor')
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerover', handleOver)
      window.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  return (
    <div ref={rootRef} className="spatial-cursor" aria-hidden="true">
      <span ref={dotRef} className="spatial-cursor__dot" />
      <span ref={ringRef} className="spatial-cursor__ring">
        <span ref={labelRef} className="spatial-cursor__label" />
      </span>
    </div>
  )
}
