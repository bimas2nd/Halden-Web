import { useEffect, useRef, useState } from 'react'
import { chapters } from '../data/companyData'

function amsterdamTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  } catch {
    return '--:--'
  }
}

export default function SpatialRail({ activeChapter = 0, progressRef }) {
  const lineRef = useRef(null)
  const percentRef = useRef(null)
  const [time, setTime] = useState(amsterdamTime)
  const active = chapters[activeChapter] ?? chapters[0]

  useEffect(() => {
    let frame = 0

    const update = () => {
      const progress = Math.min(1, Math.max(0, progressRef?.current ?? 0))
      const percent = Math.round(progress * 100)
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleY(${progress})`
      }
      if (percentRef.current) {
        percentRef.current.textContent = String(percent).padStart(2, '0')
      }
      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [progressRef])

  useEffect(() => {
    const timer = window.setInterval(() => setTime(amsterdamTime()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <aside className="spatial-rail" aria-hidden="true">
      <div className="spatial-rail__top">
        <span>THE PAVILION</span>
        <span>MMXXVI</span>
      </div>

      <div className="spatial-rail__axis">
        <span className="spatial-rail__line">
          <span ref={lineRef} />
        </span>
        <div className="spatial-rail__ticks">
          {chapters.map((chapter, index) => (
            <span
              key={chapter.id}
              className={`spatial-rail__tick${activeChapter === index ? ' is-active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="spatial-rail__chapter">
        <span className="spatial-rail__number">{active.index}</span>
        <span className="spatial-rail__label">{active.label}</span>
      </div>

      <div className="spatial-rail__bottom">
        <span ref={percentRef}>00</span>
        <span>AMS {time}</span>
      </div>
    </aside>
  )
}
