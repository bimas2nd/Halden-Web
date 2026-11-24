import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PavilionScene from './scene/PavilionScene'
import ChapterHUD from './components/ChapterHUD'
import ChapterOverlay from './components/ChapterOverlay'
import DivisionModal from './components/DivisionModal'
import InquiryModal from './components/InquiryModal'
import NavigationOverlay from './components/NavigationOverlay'
import Preloader from './components/Preloader'
import SpatialCursor from './components/SpatialCursor'
import SpatialRail from './components/SpatialRail'
import { divisions, values } from './data/companyData'

gsap.registerPlugin(ScrollTrigger)

const NEUTRAL_TONE = '#C9BFA9'

function resolveActiveChapter(fallback = 0) {
  const sections = document.querySelectorAll('[data-chapter-index]')
  const midpoint = window.innerHeight * 0.5
  let resolved = fallback

  sections.forEach((section) => {
    const anchor = section.parentElement?.classList.contains('pin-spacer')
      ? section.parentElement
      : section
    const rect = anchor.getBoundingClientRect()
    if (rect.top <= midpoint && rect.bottom > midpoint) {
      resolved = Number(section.getAttribute('data-chapter-index'))
    }
  })

  return resolved
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [preloaderVisible, setPreloaderVisible] = useState(true)
  const [activeChapter, setActiveChapter] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [divisionOpen, setDivisionOpen] = useState(null)
  const [inquiryMode, setInquiryMode] = useState(null)
  const [activeValue, setActiveValue] = useState(0)
  const [divisionFocus, setDivisionFocus] = useState(null)
  const [showHint, setShowHint] = useState(true)
  const [headerLight, setHeaderLight] = useState(false)
  const [hudLight, setHudLight] = useState(false)

  const progressRef = useRef(0)
  const activeRef = useRef(0)
  const lenisRef = useRef(null)
  const rootRef = useRef(null)
  const hintTimeoutRef = useRef(null)
  const hasScrolledRef = useRef(false)
  const enteredRef = useRef(false)
  const headerLightRef = useRef(false)
  const hudLightRef = useRef(false)

  const scrollToChapter = useCallback(
    (index) => {
      const section = document.getElementById(`chapter-${index}`)
      if (!section) return

      const anchor = section.parentElement?.classList.contains('pin-spacer')
        ? section.parentElement
        : section
      const targetTop = anchor.getBoundingClientRect().top + window.scrollY

      activeRef.current = index
      setActiveChapter(index)
      const lenis = lenisRef.current
      if (lenis) {
        if (enteredRef.current) lenis.start()
        lenis.scrollTo(targetTop, {
          offset: 0,
          duration: 1.75,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        })
      } else {
        anchor.scrollIntoView({ behavior: 'smooth' })
      }
    },
    [],
  )

  const handleEnter = useCallback(() => {
    enteredRef.current = true
    setEntered(true)
    window.clearTimeout(hintTimeoutRef.current)
    hintTimeoutRef.current = window.setTimeout(() => setShowHint(false), 14000)
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderVisible(false)
    ScrollTrigger.refresh()
  }, [])

  const handleEnterPavilion = useCallback(() => {
    scrollToChapter(1)
  }, [scrollToChapter])

  const handleValueChange = useCallback((index) => {
    setActiveValue(index)
  }, [])

  const handleDivisionFocus = useCallback((index) => {
    setDivisionFocus(index)
  }, [])

  const handleOpenDivision = useCallback((division) => {
    setDivisionFocus(null)
    setDivisionOpen(division)
  }, [])

  const handleOpenInquiry = useCallback((mode) => {
    setDivisionOpen(null)
    setInquiryMode(mode)
  }, [])

  const handleInquiryClose = useCallback(() => {
    setInquiryMode(null)
  }, [])

  const handleDivisionClose = useCallback(() => {
    setDivisionOpen(null)
  }, [])

  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    const handleAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.length < 2) return
      const target = document.querySelector(href)
      if (!target) return

      event.preventDefault()
      const chapterIndex = target.getAttribute('data-chapter-index')
      if (chapterIndex !== null) {
        scrollToChapter(Number(chapterIndex))
      } else {
        lenisRef.current?.scrollTo(target, { offset: 0, duration: 1.6 })
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [scrollToChapter])

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      syncTouch: false,
      autoRaf: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenisRef.current = lenis
    lenis.stop()

    const handleScroll = ({ progress }) => {
      progressRef.current = progress

      if (!hasScrolledRef.current && progress > 0.002 && enteredRef.current) {
        hasScrolledRef.current = true
        setShowHint(false)
      }

      const nextChapter = resolveActiveChapter(activeRef.current)
      if (nextChapter !== activeRef.current) {
        activeRef.current = nextChapter
        setActiveChapter(nextChapter)
      }

      updateLightChrome()
    }

    const updateLightChrome = () => {
      const panel = document.querySelector('.governance-panel')
      if (!panel) return
      const rect = panel.getBoundingClientRect()
      const nextHeaderLight = rect.top < 96 && rect.bottom > 90
      const nextHudLight = rect.top < window.innerHeight - 90 && rect.bottom > window.innerHeight - 70

      if (nextHeaderLight !== headerLightRef.current) {
        headerLightRef.current = nextHeaderLight
        setHeaderLight(nextHeaderLight)
      }
      if (nextHudLight !== hudLightRef.current) {
        hudLightRef.current = nextHudLight
        setHudLight(nextHudLight)
      }
    }

    const handleResize = () => {
      const nextChapter = resolveActiveChapter(activeRef.current)
      if (nextChapter !== activeRef.current) {
        activeRef.current = nextChapter
        setActiveChapter(nextChapter)
      }
      updateLightChrome()
    }

    lenis.on('scroll', handleScroll)
    lenis.on('scroll', ScrollTrigger.update)
    window.addEventListener('resize', handleResize)

    const tick = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', handleResize)
      lenis.off('scroll', handleScroll)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      lenisRef.current = null
      window.clearTimeout(hintTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const anyOverlay = Boolean(menuOpen || divisionOpen || inquiryMode)
    const locked = !entered || preloaderVisible || anyOverlay
    document.documentElement.classList.toggle('is-locked', locked)

    const lenis = lenisRef.current
    if (!lenis) return

    if (locked) {
      lenis.stop()
    } else {
      lenis.start()
    }
  }, [entered, preloaderVisible, menuOpen, divisionOpen, inquiryMode])

  const accentColor =
    activeChapter === 2
      ? values[activeValue]?.tone ?? NEUTRAL_TONE
      : activeChapter === 3 && divisionFocus !== null
        ? divisions[divisionFocus]?.tone ?? NEUTRAL_TONE
        : NEUTRAL_TONE

  const hintHidden = !entered || !showHint

  return (
    <div className={`site-shell${headerLight ? ' is-light-chrome' : ''}`} ref={rootRef}>
      <div className="webgl-layer" aria-hidden="true">
        <PavilionScene
          progressRef={progressRef}
          activeChapter={activeChapter}
          accentColor={accentColor}
        />
      </div>
      <div className="atmosphere-veil" aria-hidden="true" />
      <div className="atmosphere-grain" aria-hidden="true" />
      <div className="edge-frame" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="brand-lockup"
          onClick={() => scrollToChapter(0)}
          aria-label="HALDEN — return to the beginning"
        >
          <span className="brand-lockup__word">HALDEN</span>
          <span className="brand-lockup__sub">AMSTERDAM · EST. 2016</span>
        </button>

        <div className="header-actions">
          <nav className="header-nav" aria-label="Primary">
            <button type="button" className="header-link" onClick={() => scrollToChapter(0)}>
              The Pavilion
            </button>
            <button type="button" className="header-link" onClick={() => scrollToChapter(3)}>
              Divisions
            </button>
            <button type="button" className="header-link" onClick={() => scrollToChapter(5)}>
              Contact
            </button>
          </nav>
          <button
            type="button"
            className="menu-trigger"
            data-cursor="Index"
            onClick={handleMenuOpen}
            aria-expanded={menuOpen}
            aria-label="Open the index of chapters"
          >
            <span className="menu-trigger__label">Menu</span>
            <span className="menu-trigger__icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <main className="page-content">
        <ChapterOverlay
          entered={entered}
          activeValue={activeValue}
          onValueChange={handleValueChange}
          onOpenDivision={handleOpenDivision}
          onDivisionFocus={handleDivisionFocus}
          onInquiry={handleOpenInquiry}
          onEnterPavilion={handleEnterPavilion}
        />
      </main>

      <ChapterHUD
        activeChapter={activeChapter}
        progressRef={progressRef}
        onSelect={scrollToChapter}
        light={hudLight}
      />

      <SpatialRail activeChapter={activeChapter} progressRef={progressRef} />

      <div className={`scroll-hint${hintHidden ? ' is-hidden' : ''}`} aria-hidden="true">
        <span className="scroll-hint__line" />
        <span>Scroll to discover · Select a chapter bottom-left to jump ahead</span>
      </div>

      {menuOpen ? (
        <NavigationOverlay
          activeChapter={activeChapter}
          onClose={handleMenuClose}
          onNavigate={scrollToChapter}
        />
      ) : null}

      {divisionOpen ? (
        <DivisionModal
          division={divisionOpen}
          onClose={handleDivisionClose}
          onInquiry={handleOpenInquiry}
        />
      ) : null}

      {inquiryMode ? (
        <InquiryModal initialMode={inquiryMode} onClose={handleInquiryClose} />
      ) : null}

      {preloaderVisible ? (
        <Preloader onEnter={handleEnter} onComplete={handlePreloaderComplete} />
      ) : null}

      <SpatialCursor />
    </div>
  )
}
