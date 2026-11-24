import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { chapters, works } from '../data/companyData'

gsap.registerPlugin(ScrollTrigger)

export default function WorksArchive() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 901px)', () => {
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(getDistance(), 1)}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        },
      })

      const images = gsap.utils.toArray('.work-panel__image', section)
      images.forEach((image) => {
        gsap.fromTo(
          image,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              containerAnimation: tween,
              start: 'left 96%',
              end: 'left 46%',
              scrub: 0.7,
            },
          },
        )
      })

      gsap.fromTo(
        '.works-intro__title, .works-intro__meta',
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        },
      )
    })

    mm.add('(max-width: 900px)', () => {
      gsap.utils.toArray('.work-panel__image', section).forEach((image) => {
        gsap.fromTo(
          image,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: image,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="chapter-4"
      data-chapter-index="4"
      className="works-section"
      aria-labelledby="works-title"
    >
      <span className="chapter-ghost works-ghost" aria-hidden="true">
        05
      </span>
      <div ref={trackRef} className="works-track">
        <header className="works-intro">
          <div>
            <div className="chapter-index-mark">
              <span>{chapters[4].index} / {chapters[4].title}</span>
              <span className="chapter-index-mark__right">
                <span>{chapters[4].coordinate}</span>
                <span>Archive</span>
              </span>
            </div>
            <p className="eyebrow" style={{ marginTop: '2rem' }}>
              Three civic landmarks · 2024—2026
            </p>
          </div>

          <div className="works-intro__foot">
            <h2 id="works-title" className="works-intro__title">
              Landmarks
              <br />
              <em>of consequence.</em>
            </h2>
            <p className="body-copy" style={{ maxWidth: '24rem' }}>
              A selected archive of buildings measured not by square metres alone, but by the
              public life they are designed to hold.
            </p>
            <div className="works-intro__meta">
              <span>Selected works / 05.1—05.3</span>
              <span>Rotterdam · Zurich · Kyoto</span>
              <span>Scroll to traverse the archive →</span>
            </div>
          </div>
        </header>

        {works.map((work, index) => (
          <article className="work-panel" key={work.index} data-cursor="View">
            <div className="work-panel__image-wrap" data-index={`${work.index} / 05`}>
              <img
                className="work-panel__image"
                src={work.image}
                alt={work.imageAlt}
                style={{ objectPosition: work.imagePosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.opacity = '0'
                }}
              />
              <div className="work-panel__topline">
                <span>{work.location}</span>
                <span>{work.year}</span>
              </div>
            </div>

            <div className="work-panel__caption">
              <div className="work-panel__caption-main">
                <span className="work-panel__index">{work.index} / Selected work</span>
                <h3 className="work-panel__title">{work.title}</h3>
                <p className="work-panel__narrative">{work.narrative}</p>
              </div>
              <dl className="work-panel__specs">
                {work.specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>

      <div className="works-scroll-note" aria-hidden="true">
        <span>Scroll to traverse</span>
        <span className="works-scroll-note__arrow" />
      </div>
    </section>
  )
}
