import { useCallback, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { company } from '../data/companyData'
import { ArrowUpRight, CloseIcon } from './Icons'

export default function DivisionModal({ division, onClose, onInquiry }) {
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const closeRef = useRef(null)
  const closingRef = useRef(false)

  const requestClose = useCallback(
    (after) => {
      if (closingRef.current) return
      closingRef.current = true
      gsap.to(rootRef.current, {
        opacity: 0,
        duration: 0.34,
        ease: 'power2.out',
        onComplete: () => {
          onClose?.()
          after?.()
        },
      })
    },
    [onClose],
  )

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(
        '[data-division-reveal]',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.14,
          stagger: 0.065,
          ease: 'power3.out',
        },
      )
    }, rootRef)

    closeRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
        return
      }

      if (event.key !== 'Tab' || !rootRef.current) return
      const focusable = rootRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      context.revert()
    }
  }, [requestClose])

  return (
    <div
      ref={rootRef}
      className="division-modal"
      style={{ '--modal-tone': division.tone }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="division-modal-title"
    >
      <div className="division-modal__grain" />
      <div ref={scrollRef} className="division-modal__scroll" data-lenis-prevent>
        <div className="division-modal__inner">
          <div className="modal-topbar" data-division-reveal>
            <div className="modal-topbar__left">
              <span>HALDEN / Division dossier</span>
              <span className="modal-topbar__accent">{division.index} · {division.world}</span>
              <span>Restricted reading copy</span>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="modal-close"
              onClick={() => requestClose()}
              aria-label="Close division dossier"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="division-modal__hero">
            <div data-division-reveal>
              <div className="division-modal__kicker">
                <span className="division-modal__kicker-number">{division.index}</span>
                <span className="eyebrow eyebrow--plain">Operating division / {division.world}</span>
              </div>
              <h2 id="division-modal-title" className="division-modal__title">
                {division.name}
              </h2>
            </div>
            <p className="division-modal__summary" data-division-reveal>
              {division.summary}
            </p>
          </div>

          <div className="division-modal__content">
            <div data-division-reveal>
              <div className="division-modal__section-label">Practice narrative</div>
              <div className="division-modal__narrative">
                {division.narrative.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>

              <div className="division-modal__materials">
                <div className="division-modal__section-label" style={{ marginTop: '2.2rem' }}>
                  Three material callouts
                </div>
                {division.materials.map((material, index) => (
                  <div className="material-row" key={material.name}>
                    <span className="material-row__index">0{index + 1}</span>
                    <div>
                      <div className="material-row__name">{material.name}</div>
                      <div className="material-row__note">{material.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="division-modal__side" data-division-reveal>
              <div>
                <div className="division-modal__section-label">Technical dossier</div>
                <table className="division-dossier">
                  <tbody>
                    {division.dossier.map(([label, value]) => (
                      <tr key={label}>
                        <th className="division-dossier__label" scope="row">
                          {label}
                        </th>
                        <td className="division-dossier__value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="division-modal__cta">
                <span className="division-modal__cta-title">Work with this division.</span>
                <p className="division-modal__cta-copy">
                  Programme enquiries are reviewed by the relevant studio lead. Response within two
                  business days.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => requestClose(() => onInquiry?.('project'))}
                >
                  Initiate a programme
                  <ArrowUpRight className="h-3 w-3" />
                </button>
                <a className="text-button" href={`mailto:${company.partnerships}`}>
                  {company.partnerships}
                </a>
              </div>
            </div>
          </div>

          <div className="division-modal__foot" data-division-reveal>
            <span>{company.coordinates} · The Pavilion</span>
            <span>HALDEN {division.index} / {company.legalName}</span>
            <button type="button" className="text-button" onClick={() => requestClose()}>
              Return to the pavilion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
