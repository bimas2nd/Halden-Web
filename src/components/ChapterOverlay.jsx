import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  chapters,
  company,
  divisions,
  leadership,
  metrics,
  offices,
  values,
} from '../data/companyData'
import { ArrowUpRight } from './Icons'
import WorksArchive from './WorksArchive'

gsap.registerPlugin(ScrollTrigger)

function ChapterGhost({ index }) {
  return (
    <span className="chapter-ghost" aria-hidden="true">
      {index}
    </span>
  )
}

function ChapterMark({ index, rightLabel }) {
  const chapter = chapters[index]
  return (
    <div className="chapter-index-mark">
      <span>
        {chapter.index} / {chapter.title}
      </span>
      <span className="chapter-index-mark__right">
        <span>{chapter.coordinate}</span>
        <span>{rightLabel ?? chapter.label}</span>
      </span>
    </div>
  )
}

function formatMetricValue(metric, value) {
  return metric.decimals > 0 ? value.toFixed(metric.decimals) : String(Math.round(value))
}

function AnimatedMetric({ metric }) {
  const valueRef = useRef(null)
  const wrapperRef = useRef(null)

  const finalText = `${metric.prefix ?? ''}${formatMetricValue(metric, metric.value)}${metric.suffix ?? ''}`

  useEffect(() => {
    const node = valueRef.current
    const trigger = wrapperRef.current
    if (!node || !trigger) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      node.textContent = formatMetricValue(metric, metric.value)
      return
    }

    node.textContent = formatMetricValue(metric, 0)
    const counter = { value: 0 }
    const animation = gsap.to(counter, {
      value: metric.value,
      duration: 1.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start: 'top 88%',
        once: true,
      },
      onUpdate: () => {
        node.textContent = formatMetricValue(metric, counter.value)
      },
    })

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [metric])

  return (
    <span className="metric-row__value" aria-label={finalText} ref={wrapperRef}>
      {metric.prefix ? (
        <span className="metric-row__prefix" aria-hidden="true">
          {metric.prefix}
        </span>
      ) : null}
      <span aria-hidden="true" ref={valueRef}>
        {formatMetricValue(metric, metric.value)}
      </span>
      {metric.suffix ? (
        <span className="metric-row__suffix" aria-hidden="true">
          {metric.suffix}
        </span>
      ) : null}
    </span>
  )
}

function Hero({ entered, onEnter }) {
  return (
    <section
      id="chapter-0"
      data-chapter-index="0"
      className={`chapter-section chapter-section--hero${entered ? ' is-entered' : ''}`}
      aria-labelledby="hero-title"
    >
      <div
        className="hero-stage"
        onClick={(event) => {
          if (event.target.closest('button, a')) return
          onEnter?.()
        }}
      >
        <div className="hero-overline">
          <span className="hero-overline__rule" />
          <span className="hero-overline__text">01 — Prologue · Architectural Infrastructure</span>
          <span className="hero-overline__rule" />
        </div>

        <h1 id="hero-title" className="hero-wordmark">
          HALDEN
        </h1>

        <div className="hero-definition">
          <p className="hero-definition__phonetic">{company.phonetic}</p>
          <span className="hero-definition__line" aria-hidden="true" />
          <p className="hero-definition__meaning">the stillness of engineered permanence</p>
        </div>

        <p className="hero-subtitle">{company.tagline}</p>

        <button type="button" className="hero-enter" onClick={onEnter} data-cursor="Enter">
          <span className="hero-enter__line" aria-hidden="true" />
          Scroll or click anywhere to enter
        </button>
      </div>

      <div className="hero-foot" aria-hidden="true">
        <div className="hero-foot__left">
          <span>The Pavilion / MMXXVI</span>
          <span>Architectural Infrastructure &amp; Environmental Systems</span>
        </div>
        <div className="hero-foot__center">
          <span>Scroll to descend</span>
          <span />
        </div>
        <div className="hero-foot__right">
          <span>{company.coordinates}</span>
          <span>Herengracht 412 · Amsterdam</span>
        </div>
      </div>
    </section>
  )
}

function VisionChapter() {
  return (
    <section
      id="chapter-1"
      data-chapter-index="1"
      className="chapter-section chapter-section--vision"
      aria-labelledby="vision-title"
    >
      <ChapterMark index={1} rightLabel="Vision & Mission" />
      <ChapterGhost index="02" />

      <div className="vision-grid">
        <div className="vision-statement">
          <div className="vision-statement__label" data-reveal>
            <span className="eyebrow eyebrow--plain">OUR VISION</span>
            <em>02.A</em>
          </div>
          <h2 id="vision-title" className="vision-statement__title" data-reveal>
            Monumental engineering,
            <br />
            <em>ecological stillness.</em>
          </h2>
          <p className="vision-quote" data-reveal>
            To redefine the built environment where monumental engineering and ecological
            stillness coexist without compromise.
          </p>
        </div>

        <div className="vision-mission">
          <div className="vision-statement__label" data-reveal>
            <span className="eyebrow eyebrow--plain">OUR MISSION</span>
            <em>02.B</em>
          </div>
          <div className="vision-mission__body">
            <p data-reveal>
              We partner with cities, institutions, and cultural foundations to design, engineer,
              and deliver low-carbon structural systems—combining Dutch spatial precision with
              next-generation material science.
            </p>
            <p data-reveal>
              Founded in Amsterdam in 2016, HALDEN was conceived as a counterweight to disposable
              development: a practice where engineering, ecology, and civic memory are held in the
              same drawing. We work at the scale of the institution and the patience of the
              century.
            </p>
            <p data-reveal>
              Our studios in Amsterdam, Zurich, Kyoto, and Singapore operate as one table. Material
              researchers sit beside structural engineers; acoustic modellers beside curators. The
              outcome is not a signature style, but a standard of endurance.
            </p>
          </div>
          <div className="vision-mission__signature" data-reveal>
            <span />
            HALDEN GROUP / FOUNDING PRINCIPLE
          </div>
        </div>
      </div>

      <div className="metrics" aria-label="Company metrics">
        {metrics.map((metric) => (
          <div className="metric-row" key={metric.label} data-reveal>
            <span className="metric-row__label">{metric.label}</span>
            <AnimatedMetric metric={metric} />
            <span className="metric-row__note">{metric.note}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ValuesChapter({ activeValue, onValueChange }) {
  const listRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const activeBody = list.querySelector('.value-row.is-active .value-row__body-inner')
    if (activeBody) {
      gsap.killTweensOf(activeBody)
      gsap.fromTo(
        activeBody,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
      )
    }

    return () => {
      if (activeBody) gsap.killTweensOf(activeBody)
    }
  }, [activeValue])

  return (
    <section
      id="chapter-2"
      data-chapter-index="2"
      className="chapter-section chapter-section--values"
      aria-labelledby="values-title"
    >
      <ChapterMark index={2} rightLabel="Ethos" />
      <ChapterGhost index="03" />

      <div className="values-layout">
        <div className="values-intro">
          <p className="eyebrow eyebrow--plain" data-reveal>
            03 / Core Values &amp; Ethos
          </p>
          <h2 id="values-title" className="values-intro__title" data-reveal>
            Four principles.
            <br />
            <em>One enduring ethic.</em>
          </h2>
          <p className="values-intro__copy" data-reveal>
            Our practice is governed by an ethic of restraint, material truth, and long horizons.
            Hover or select a principle to enter its position.
          </p>
          <div className="values-intro__tone" data-reveal>
            <span
              className="values-intro__tone-dot"
              style={{ background: values[activeValue]?.tone }}
              aria-hidden="true"
            />
            <span>Active material tone / {values[activeValue]?.index}</span>
          </div>
          <div className="values-hint" aria-hidden="true">
            <span />
            Select to reveal
          </div>
        </div>

        <div className="values-list" ref={listRef}>
          {values.map((value, index) => {
            const isActive = activeValue === index
            return (
              <article
                key={value.index}
                className={`value-row${isActive ? ' is-active' : ''}`}
                style={{ '--value-tone': value.tone }}
              >
                <button
                  type="button"
                  className="value-row__head"
                  aria-expanded={isActive}
                  aria-controls={`value-panel-${value.index}`}
                  onClick={() => onValueChange(index)}
                  onMouseEnter={() => onValueChange(index)}
                  onFocus={() => onValueChange(index)}
                >
                  <span className="value-row__index">{value.index}</span>
                  <span>
                    <span className="value-row__title">{value.title}</span>
                    <span className="value-row__short">{value.short}</span>
                  </span>
                  <span className="value-row__plus" aria-hidden="true" />
                </button>
                <div className="value-row__body" id={`value-panel-${value.index}`}>
                  <div className="value-row__body-inner">
                    <p className="value-row__copy">{value.body}</p>
                    <span className="value-row__foot">
                      <span aria-hidden="true" />
                      {value.footnote}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function DivisionsChapter({ onOpenDivision, onDivisionFocus }) {
  return (
    <section
      id="chapter-3"
      data-chapter-index="3"
      className="chapter-section chapter-section--divisions"
      aria-labelledby="divisions-title"
    >
      <ChapterMark index={3} rightLabel="Three Worlds" />
      <ChapterGhost index="04" />

      <div className="divisions-head">
        <h2 id="divisions-title" className="divisions-head__title" data-reveal>
          Three worlds of
          <br />
          <em>applied intelligence.</em>
        </h2>
        <p className="divisions-head__note" data-reveal>
          One practice, three operating divisions. Each world combines a distinct material
          intelligence with the same governing standard of permanence.
        </p>
      </div>

      <div className="division-list">
        {divisions.map((division, index) => (
          <button
            key={division.id}
            type="button"
            className="division-row"
            style={{ '--division-tone': division.tone }}
            data-cursor="Enter"
            onClick={() => onOpenDivision(division)}
            onMouseEnter={() => onDivisionFocus(index)}
            onMouseLeave={() => onDivisionFocus(null)}
            onFocus={() => onDivisionFocus(index)}
            onBlur={() => onDivisionFocus(null)}
            aria-label={`Enter ${division.name}: ${division.discipline}`}
          >
            <span className="division-row__index">{division.index}</span>
            <span className="division-row__main">
              <span className="division-row__world">
                {division.world} · {division.discipline.split(' · ')[0]}
              </span>
              <span className="division-row__name">{division.name}</span>
              <span className="division-row__summary">{division.summary}</span>
            </span>
            <span className="division-row__meta">
              <span>{division.discipline}</span>
              <span>Lead studio / {division.dossier[2][1]}</span>
            </span>
            <span className="division-row__enter">
              <span className="division-row__enter-arrow">
                <ArrowUpRight className="h-3 w-3" />
              </span>
              Enter Division
            </span>
            <span className="division-row__watermark" aria-hidden="true">
              0{index + 1}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function GovernanceChapter({ onInquiry }) {
  return (
    <section
      id="chapter-5"
      data-chapter-index="5"
      className="chapter-section chapter-section--governance"
      aria-labelledby="governance-title"
    >
      <div className="governance-panel">
        <ChapterGhost index="06" />
        <ChapterMark index={5} rightLabel="Governance & Contact" />

        <div className="governance-head">
          <h2 id="governance-title" className="governance-head__title" data-reveal>
            A practice of
            <br />
            <em>permanence.</em>
          </h2>
          <p className="governance-head__copy" data-reveal>
            HALDEN is led by a compact group of architects, engineers, and material scientists. Our
            governance is built for continuity: decisions are made with the next custodian of the
            building in mind, not only the next quarter.
          </p>
        </div>

        <div className="leadership" aria-label="Executive leadership">
          <div className="leadership__header" aria-hidden="true">
            <span>No.</span>
            <span>Name</span>
            <span>Role</span>
            <span>Office</span>
            <span>Tenure</span>
          </div>
          {leadership.map((person, index) => (
            <div className="leadership__row" key={person.name} data-reveal>
              <span className="leadership__index">0{index + 1}</span>
              <span className="leadership__name">{person.name}</span>
              <span className="leadership__role">{person.role}</span>
              <span className="leadership__office">{person.office}</span>
              <span className="leadership__tenure">{person.tenure}</span>
            </div>
          ))}
        </div>

        <div className="inquiry-block">
          <div className="inquiry-block__kicker" data-reveal>
            <span className="eyebrow eyebrow--plain">Partnership &amp; RFP</span>
            <h3 className="inquiry-block__title">
              Begin a
              <br />
              <em>conversation.</em>
            </h3>
          </div>

          <div className="inquiry-actions" data-reveal>
            <button
              type="button"
              className="inquiry-link"
              data-cursor="Open"
              onClick={() => onInquiry('dossier')}
            >
              <span>
                <span className="inquiry-link__title">Request a Corporate Dossier</span>
                <span className="inquiry-link__meta">
                  Capabilities · Governance · Material research
                </span>
              </span>
              <span className="inquiry-link__icon" aria-hidden="true">
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </button>

            <button
              type="button"
              className="inquiry-link"
              data-cursor="Open"
              onClick={() => onInquiry('project')}
            >
              <span>
                <span className="inquiry-link__title">Initiate a Project</span>
                <span className="inquiry-link__meta">
                  Partnerships office · Response within 48 hours
                </span>
              </span>
              <span className="inquiry-link__icon" aria-hidden="true">
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand__word">HALDEN</div>
          <p className="footer-brand__line">
            Architectural infrastructure and environmental systems, engineered in Amsterdam for
            enduring civic life.
          </p>
        </div>

        <div>
          <div className="footer-label">Amsterdam HQ</div>
          <address className="footer-address">
            {company.address[0]}
            <br />
            {company.address[1]}
            <br />
            {company.address[2]}
          </address>
          <div className="footer-links" style={{ marginTop: '1.1rem' }}>
            <a className="footer-link" href={`mailto:${company.email}`}>
              {company.email}
            </a>
            <a className="footer-link" href={`tel:${company.phone.replace(/\s/g, '')}`}>
              {company.phone}
            </a>
          </div>
        </div>

        <div>
          <div className="footer-label">Regional Offices</div>
          <div className="footer-address">
            {offices
              .slice(1)
              .map((office) => office.city)
              .join(' · ')}
          </div>
          <div className="footer-links" style={{ marginTop: '1.1rem' }}>
            <a className="footer-link" href={`mailto:${company.partnerships}`}>
              Partnerships
            </a>
            <a className="footer-link" href={`mailto:${company.press}`}>
              Press office
            </a>
          </div>
        </div>

        <div>
          <div className="footer-label">Practice Index</div>
          <div className="footer-links">
            <a className="footer-link" href="#chapter-1">
              Sustainability Report
            </a>
            <a className="footer-link" href="mailto:careers@halden.group">
              Careers
            </a>
            <a className="footer-link" href="mailto:privacy@halden.group">
              Privacy Policy
            </a>
            <a className="footer-link" href="#chapter-5">
              Corporate Governance
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{company.copyright}</span>
        <span>{company.legalName} · Herengracht 412 · 1017 BZ Amsterdam</span>
        <span className="footer-bottom__right">
          <span>EN</span>
          <span>52°22′11″ N / 4°53′06″ E</span>
        </span>
      </div>
    </footer>
  )
}

export default function ChapterOverlay({
  entered,
  activeValue,
  onValueChange,
  onOpenDivision,
  onDivisionFocus,
  onInquiry,
  onEnterPavilion,
}) {
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    })

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    const refreshTimer = window.setTimeout(refresh, 500)

    return () => {
      window.clearTimeout(refreshTimer)
      context.revert()
    }
  }, [])

  return (
    <>
      <Hero entered={entered} onEnter={onEnterPavilion} />
      <VisionChapter />
      <ValuesChapter activeValue={activeValue} onValueChange={onValueChange} />
      <DivisionsChapter onOpenDivision={onOpenDivision} onDivisionFocus={onDivisionFocus} />
      <WorksArchive />
      <GovernanceChapter onInquiry={onInquiry} />
      <SiteFooter />
    </>
  )
}
