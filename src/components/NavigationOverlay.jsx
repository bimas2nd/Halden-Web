import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { chapters, company, offices } from '../data/companyData'
import { CloseIcon } from './Icons'

export default function NavigationOverlay({ activeChapter = 0, onClose, onNavigate }) {
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const closingRef = useRef(false)
  const [closing, setClosing] = useState(false)

  const closeWithTarget = useCallback(
    (target = null) => {
      if (closingRef.current) return
      closingRef.current = true
      setClosing(true)

      gsap.to(rootRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.72,
        ease: 'power4.inOut',
        onComplete: () => {
          onClose?.()
          if (target !== null) onNavigate?.(target)
        },
      })
    },
    [onClose, onNavigate],
  )

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power4.inOut' },
      )

      gsap.fromTo(
        '[data-menu-top]',
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.22, stagger: 0.05, ease: 'power3.out' },
      )

      gsap.fromTo(
        '[data-menu-item]',
        { yPercent: 38, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.24,
          stagger: 0.055,
          ease: 'power4.out',
        },
      )

      gsap.fromTo(
        '[data-menu-aside] > *',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, stagger: 0.07, ease: 'power3.out' },
      )
    }, rootRef)

    panelRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeWithTarget()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      context.revert()
    }
  }, [closeWithTarget])

  return (
    <div
      ref={rootRef}
      className={`nav-overlay${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="The HALDEN index"
    >
      <div className="nav-overlay__grain" />
      <div ref={panelRef} className="nav-overlay__frame" tabIndex={-1}>
        <div className="nav-overlay__top">
          <div className="brand-lockup" data-menu-top>
            <span className="brand-lockup__word">HALDEN</span>
            <span className="brand-lockup__sub">AMSTERDAM · EST. 2016</span>
          </div>
          <div className="nav-overlay__meta" data-menu-top>
            <span>Index of chapters</span>
            <span>MMXXVI / 01—06</span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => closeWithTarget()}
            aria-label="Close the index"
            data-menu-top
          >
            <CloseIcon />
          </button>
        </div>

        <div className="nav-overlay__body">
          <nav className="nav-index" aria-label="Chapters">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                type="button"
                className={`nav-index__item${activeChapter === index ? ' is-active' : ''}`}
                onClick={() => closeWithTarget(index)}
                data-menu-item
              >
                <span className="nav-index__number">{chapter.index}</span>
                <span className="nav-index__title">{chapter.title}</span>
                <span className="nav-index__label">
                  {activeChapter === index ? `Here · ${chapter.label}` : chapter.label}
                </span>
              </button>
            ))}
          </nav>

          <aside className="nav-aside" data-menu-aside>
            <div className="nav-aside__block">
              <span className="nav-aside__label">Amsterdam Studio</span>
              <span className="nav-aside__value">
                {company.address[0]}
                <br />
                {company.address[1]}
                <br />
                {company.address[2]}
              </span>
            </div>
            <div className="nav-aside__block">
              <span className="nav-aside__label">Enquiries</span>
              <span className="nav-aside__value">
                <a href={`mailto:${company.partnerships}`}>{company.partnerships}</a>
                <br />
                <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
              </span>
            </div>
            <div className="nav-aside__block">
              <span className="nav-aside__label">Regional Offices</span>
              <span className="nav-aside__value">
                {offices
                  .slice(1)
                  .map((office) => office.city)
                  .join(' · ')}
              </span>
            </div>
          </aside>
        </div>

        <div className="nav-overlay__foot" data-menu-top>
          <span>
            {company.coordinates} · The Pavilion
          </span>
          <span>Architectural Infrastructure &amp; Environmental Systems</span>
        </div>
      </div>
    </div>
  )
}
