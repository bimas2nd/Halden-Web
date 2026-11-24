import { useEffect, useRef, useState } from 'react'
import { chapters } from '../data/companyData'

export default function ChapterHUD({ activeChapter = 0, progressRef, onSelect, light = false }) {
  const [open, setOpen] = useState(false)
  const lineRef = useRef(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      const progress = Math.min(1, Math.max(0, progressRef?.current ?? 0))
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${progress})`
      }
      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [progressRef])

  const active = chapters[activeChapter] ?? chapters[0]

  return (
    <aside
      className={`chapter-hud${open ? ' is-open' : ''}${light ? ' is-light' : ''}`}
      aria-label="Chapter navigation"
    >
      <div className="chapter-hud__inner">
        <div className="chapter-hud__eyebrow">
          <span>Chapter index</span>
          <span className="chapter-hud__readout">
            {String(activeChapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
          </span>
        </div>

        <div className="chapter-hud__progress" aria-hidden="true">
          <span ref={lineRef} />
        </div>

        <button
          type="button"
          className="chapter-hud__toggle"
          aria-expanded={open}
          aria-controls="chapter-hud-list"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="chapter-hud__current">
            {open ? (
              <span>Index / Close</span>
            ) : (
              <>
                <span className="chapter-hud__num">{active.index}</span>
                <span>{active.title}</span>
              </>
            )}
          </span>
          <span className="chapter-hud__toggle-icon" aria-hidden="true" />
        </button>

        <nav id="chapter-hud-list" className="chapter-hud__list" aria-label="Jump to chapter">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              className={`chapter-hud__item${activeChapter === index ? ' is-active' : ''}`}
              aria-current={activeChapter === index ? 'true' : undefined}
              onClick={() => {
                onSelect?.(index)
                setOpen(false)
              }}
            >
              <span className="chapter-hud__num">{chapter.index}</span>
              <span className="chapter-hud__name">{chapter.title}</span>
              <span className="chapter-hud__tag">{chapter.label}</span>
            </button>
          ))}
        </nav>

        <div className="chapter-hud__foot">
          <span>A—06 / The Pavilion</span>
          <span>36.4 m</span>
        </div>
      </div>
    </aside>
  )
}
