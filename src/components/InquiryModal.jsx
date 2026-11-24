import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { company, inquiries } from '../data/companyData'
import { ArrowUpRight, CloseIcon } from './Icons'

const initialForm = {
  name: '',
  organisation: '',
  email: '',
  sector: '',
  scope: '',
  timeline: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Please enter your name.'
  if (!form.organisation.trim()) errors.organisation = 'Please enter your organisation.'
  if (!form.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  return errors
}

export default function InquiryModal({ initialMode = 'project', onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reference, setReference] = useState('')
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const scrollRef = useRef(null)
  const closingRef = useRef(false)
  const timerRef = useRef(null)

  const content = inquiries[mode] ?? inquiries.project

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: onClose,
    })
    gsap.to(panelRef.current, {
      y: 18,
      duration: 0.3,
      ease: 'power2.in',
    })
  }, [onClose])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: 'power2.out' })
      gsap.fromTo(
        panelRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
      )
      gsap.fromTo(
        '[data-inquiry-reveal]',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.16, stagger: 0.04, ease: 'power3.out' },
      )
    }, rootRef)

    panelRef.current?.focus({ preventScroll: true })

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
      window.clearTimeout(timerRef.current)
      context.revert()
    }
  }, [requestClose])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [mode, submitted])

  const updateField = (field) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (sending) return

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0]
      panelRef.current?.querySelector(`[name="${firstField}"]`)?.focus()
      return
    }

    setSending(true)
    timerRef.current = window.setTimeout(() => {
      setSending(false)
      setSubmitted(true)
      setReference(`HLD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`)
    }, 1150)
  }

  const switchMode = (nextMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setSubmitted(false)
    setErrors({})
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  return (
    <div
      className="inquiry-modal"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <div ref={panelRef} className="inquiry-panel" tabIndex={-1}>
        <div className="inquiry-panel__grain" />
        <div ref={scrollRef} className="inquiry-panel__scroll" data-lenis-prevent>
          <div className="inquiry-panel__top">
            <div className="mono">
              HALDEN / Partnership office
              <br />
              52°22′11″ N · 4°53′06″ E
            </div>
            <button
              ref={closeRef}
              type="button"
              className="modal-close"
              onClick={requestClose}
              aria-label="Close enquiry form"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="inquiry-tabs" role="tablist" aria-label="Enquiry type">
            <button
              type="button"
              className={`inquiry-tab${mode === 'project' ? ' is-active' : ''}`}
              role="tab"
              aria-selected={mode === 'project'}
              onClick={() => switchMode('project')}
            >
              Initiate a Project
            </button>
            <button
              type="button"
              className={`inquiry-tab${mode === 'dossier' ? ' is-active' : ''}`}
              role="tab"
              aria-selected={mode === 'dossier'}
              onClick={() => switchMode('dossier')}
            >
              Request Corporate Dossier
            </button>
          </div>

          {submitted ? (
            <div className="inquiry-success" role="status" aria-live="polite">
              <div className="inquiry-success__mark" aria-hidden="true">
                ✓
              </div>
              <h2 id="inquiry-title" className="inquiry-success__title">
                Enquiry received.
              </h2>
              <p className="inquiry-success__copy">
                Thank you, {form.name.split(' ')[0]}. Your enquiry has been logged as{' '}
                <strong>{reference}</strong>. The HALDEN partnerships office will respond to{' '}
                {form.email} within two business days.
              </p>
              <button type="button" className="text-button" onClick={requestClose}>
                Return to the pavilion
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="inquiry-grid">
              <div data-inquiry-reveal>
                <span className="mono">{content.kicker}</span>
                <h2 id="inquiry-title" className="inquiry-intro__title">
                  {content.title}
                </h2>
                <p className="inquiry-intro__copy">{content.intro}</p>
                <div className="inquiry-intro__contact">
                  <span>Direct correspondence</span>
                  <a href={`mailto:${company.partnerships}`}>{company.partnerships}</a>
                  <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
                  <span>{company.address.join(' · ')}</span>
                </div>
              </div>

              <form className="inquiry-form" onSubmit={handleSubmit} noValidate data-inquiry-reveal>
                <div className="form-row">
                  <div className={`form-field${errors.name ? ' has-error' : ''}`}>
                    <label htmlFor="inquiry-name">Name</label>
                    <input
                      id="inquiry-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Your full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name ? (
                      <span className="form-error" id="name-error">
                        {errors.name}
                      </span>
                    ) : null}
                  </div>

                  <div className={`form-field${errors.organisation ? ' has-error' : ''}`}>
                    <label htmlFor="inquiry-organisation">Organisation</label>
                    <input
                      id="inquiry-organisation"
                      name="organisation"
                      type="text"
                      value={form.organisation}
                      onChange={updateField('organisation')}
                      placeholder="Institution or practice"
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.organisation)}
                      aria-describedby={errors.organisation ? 'organisation-error' : undefined}
                    />
                    {errors.organisation ? (
                      <span className="form-error" id="organisation-error">
                        {errors.organisation}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-field${errors.email ? ' has-error' : ''}`}>
                    <label htmlFor="inquiry-email">Email</label>
                    <input
                      id="inquiry-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      placeholder="name@organisation.org"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email ? (
                      <span className="form-error" id="email-error">
                        {errors.email}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-field">
                    <label htmlFor="inquiry-sector">Sector</label>
                    <select id="inquiry-sector" name="sector" value={form.sector} onChange={updateField('sector')}>
                      <option value="">Select a sector</option>
                      <option>Cultural institution</option>
                      <option>City / municipality</option>
                      <option>Private foundation</option>
                      <option>Infrastructure authority</option>
                      <option>Development partner</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="inquiry-scope">
                    {mode === 'project' ? 'Project scope' : 'Area of interest'}
                  </label>
                  <textarea
                    id="inquiry-scope"
                    name="scope"
                    value={form.scope}
                    onChange={updateField('scope')}
                    placeholder={
                      mode === 'project'
                        ? 'Site, programme, ambition, and the horizon you are designing for.'
                        : 'Divisions, material research, or governance details you would like to receive.'
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="inquiry-timeline">Anticipated horizon</label>
                  <select id="inquiry-timeline" name="timeline" value={form.timeline} onChange={updateField('timeline')}>
                    <option value="">Select a horizon</option>
                    <option>2026—2027</option>
                    <option>2028—2030</option>
                    <option>2030 and beyond</option>
                    <option>Exploratory</option>
                  </select>
                </div>

                <button type="submit" className="form-submit" disabled={sending}>
                  <span>{sending ? 'Transmitting enquiry' : 'Send to partnerships office'}</span>
                  <span className="form-submit__arrow" aria-hidden="true">
                    {sending ? '·' : '↗'}
                  </span>
                </button>

                <p className="inquiry-note">
                  Your details are used only to respond to this enquiry. No mailing lists, no
                  third-party sharing.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
