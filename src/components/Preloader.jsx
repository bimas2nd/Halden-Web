import { useEffect, useRef, useState } from 'react'
import { company } from '../data/companyData'

export default function Preloader({ onEnter, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const finishedRef = useRef(false)
  const startRef = useRef(0)
  const exitTimerRef = useRef(null)
  const doneTimerRef = useRef(null)

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setProgress(100)
  }

  useEffect(() => {
    let frame = 0
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const next = Math.min(100, (elapsed / 1750) * 100)
      setProgress((value) => (next > value ? next : value))

      if (next < 100) {
        frame = requestAnimationFrame(tick)
      } else {
        finishedRef.current = true
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (progress < 100) return

    exitTimerRef.current = window.setTimeout(() => {
      setExiting(true)
      onEnter?.()
      doneTimerRef.current = window.setTimeout(() => {
        onComplete?.()
      }, 1250)
    }, 620)

    return () => {
      window.clearTimeout(exitTimerRef.current)
      window.clearTimeout(doneTimerRef.current)
    }
  }, [progress, onEnter, onComplete])

  const handleSkip = () => {
    if (exiting) return
    finish()
  }

  const digits = String(Math.round(progress)).padStart(2, '0')

  return (
    <div
      className={`preloader${exiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading the HALDEN Pavilion"
      onClick={handleSkip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSkip()
        }
      }}
      tabIndex={0}
    >
      <div className="preloader__grain" />
      <div className="preloader__top">
        <div>
          <div>{company.legalName}</div>
          <div>AMSTERDAM · EST. 2016</div>
        </div>
        <div className="preloader__top-right">
          <div>THE PAVILION</div>
          <div>EXHIBITION MMXXVI</div>
        </div>
      </div>

      <div className="preloader__center">
        <div className="preloader__wordmark">HALDEN</div>
        <div className="preloader__sub">Architectural Infrastructure &amp; Environmental Systems</div>
        <div className="preloader__enter">
          {progress >= 100 ? 'Scroll or click anywhere to enter' : 'Preparing the gallery'}
        </div>
      </div>

      <div className="preloader__bottom">
        <div className="preloader__bottom-left">
          <div>
            <div>Indexing the pavilion</div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className="preloader__progress">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
          <div className="preloader__percent" aria-hidden="true">
            {digits}
          </div>
        </div>
        <div className="preloader__top-right">
          <div>52°22′11″ N</div>
          <div>4°53′06″ E</div>
        </div>
      </div>
    </div>
  )
}
