import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { getHeroLayout, HERO_COVER_ORDER } from './hero-layout'
import './hero.css'

const themes = ['Stellar', 'Lovely', 'Vivid'] as const
const imagePath = (index: number, reveal = false) => `/assets/hero/${reveal ? 'e' : 'c'}${String(HERO_COVER_ORDER[index]).padStart(2, '0')}.webp`

function Sparkle() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12C17.373 12 12 6.627 12 0Z" /></svg>
}

function Arrow() {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
}

function HeroText({ word = 'Delightful', decorative = false }: { word?: string; decorative?: boolean }) {
  const Heading = decorative ? 'div' : 'h1'
  return (
    <div className="hero-text-block">
      <Heading className="hero-title">
        <span className="hero-wordmark"><img src="/assets/wordmark.svg" alt={decorative ? '' : 'Luma'} width="80" height="29" /></span>
        <span className="title-mask"><span className="title-rise" style={{ animationDelay: '.25s' }}>{word}</span></span>
        <span className="title-mask"><span className="title-rise" style={{ animationDelay: '.4s' }}>events</span></span>
        <span className="title-mask"><span className="title-rise" style={{ animationDelay: '.55s' }}><span className="gradient-text">start here</span></span></span>
      </Heading>
      <p className="hero-paragraph">
        From <a className="example-run" href="/jlnifjub" tabIndex={decorative ? -1 : undefined}>run clubs</a> to <a className="example-party" href="/5.5" tabIndex={decorative ? -1 : undefined}>launch parties</a> and <a className="example-fireworks" href="/july4-brooklyn" tabIndex={decorative ? -1 : undefined}>firework shows</a>, Luma makes every event feel effortless.
      </p>
    </div>
  )
}

/** Lightweight canvas starfield for the circular hover reveal. */
function Starfield({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    let width = 0, height = 0
    const stars = Array.from({ length: 360 }, (_, i) => ({
      angle: i * 2.399963, depth: ((i * 47) % 360) / 360,
      speed: .000035 + (i % 7) * .000003,
    }))
    let previous = 0
    const draw = (time: number) => {
      const elapsed = previous ? Math.min(time - previous, 40) : 0
      previous = time
      context.clearRect(0, 0, width, height)
      const cx = width / 2, cy = height * .61
      for (const star of stars) {
        if (!reducedMotion.matches) star.depth = (star.depth + elapsed * star.speed) % 1
        const distance = Math.pow(star.depth, 2) * Math.max(width, height) * .75
        const x = cx + Math.cos(star.angle) * distance
        const y = cy + Math.sin(star.angle) * distance
        context.strokeStyle = `rgba(210, 221, 255, ${.18 + star.depth * .72})`
        context.lineWidth = .6 + star.depth
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + Math.cos(star.angle) * star.depth * 12, y + Math.sin(star.angle) * star.depth * 12)
        context.stroke()
      }
      if (!reducedMotion.matches && visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const syncAnimation = () => {
      cancelAnimationFrame(frame)
      previous = 0
      if (visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      syncAnimation()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncAnimation()
    })
    intersectionObserver.observe(canvas)
    reducedMotion.addEventListener('change', syncAnimation)
    document.addEventListener('visibilitychange', syncAnimation)
    resize()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersectionObserver.disconnect()
      reducedMotion.removeEventListener('change', syncAnimation)
      document.removeEventListener('visibilitychange', syncAnimation)
    }
  }, [active])

  return <canvas className="hero-starfield" ref={canvasRef} aria-hidden="true" />
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [size, setSize] = useState({ width: 1440, height: 900 })
  const [hovered, setHovered] = useState(false)
  const [theme, setTheme] = useState(0)
  const [center, setCenter] = useState({ x: 720, y: 609 })
  const enterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const didReveal = useRef(false)

  useEffect(() => {
    const element = heroRef.current
    if (!element) return
    const hoverMedia = window.matchMedia('(hover: hover) and (min-width: 451px)')
    const syncReveal = () => {
      if (!hoverMedia.matches) {
        clearTimeout(enterTimer.current)
        clearTimeout(exitTimer.current)
        didReveal.current = false
        setHovered(false)
      }
    }
    hoverMedia.addEventListener('change', syncReveal)
    const observer = new ResizeObserver(() => {
      setSize({ width: element.clientWidth, height: element.clientHeight })
      if (buttonRef.current) {
        const button = buttonRef.current.getBoundingClientRect()
        const hero = element.getBoundingClientRect()
        setCenter({ x: button.left - hero.left + button.width / 2, y: button.top - hero.top + button.height / 2 })
      }
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      hoverMedia.removeEventListener('change', syncReveal)
      clearTimeout(enterTimer.current)
      clearTimeout(exitTimer.current)
    }
  }, [])

  function reveal() {
    if (!window.matchMedia('(hover: hover) and (min-width: 451px)').matches) return
    clearTimeout(exitTimer.current)
    clearTimeout(enterTimer.current)
    enterTimer.current = setTimeout(() => { didReveal.current = true; setHovered(true) }, 200)
  }

  function hide() {
    clearTimeout(enterTimer.current)
    clearTimeout(exitTimer.current)
    setHovered(false)
    if (didReveal.current) {
      exitTimer.current = setTimeout(() => { setTheme(value => (value + 1) % themes.length); didReveal.current = false }, 650)
    }
  }

  const cards = getHeroLayout(size.width, size.height)
  const heroStyle = {
    '--reveal-x': `${center.x}px`, '--reveal-y': `${center.y}px`,
    '--reveal-radius': `${Math.max(size.width, size.height) * .63}px`,
  } as CSSProperties

  return (
    <section ref={heroRef} className={`hero ${hovered ? 'is-revealed' : ''} theme-${theme}`} style={heroStyle} aria-label="Delightful events start here">
      <header className="topnav">
        <a className="brand-spark" href="/" aria-label="Luma Home"><Sparkle /></a>
        <a className="sign-in" href="https://luma.com/signin?next=%2Fhome">Sign In</a>
      </header>

      <div className="poster-field" aria-hidden="true">
        {cards.map(card => (
          <div className="poster-position" key={card.index} style={{ left: card.left, top: card.top, width: card.size, height: card.size, zIndex: card.zIndex, '--card-scale': card.size / 160, '--enter-delay': `${.9 + card.index * .07}s`, '--float-delay': `${-card.index * 4.8}s` } as CSSProperties}>
            <div className="poster-float"><div className="poster-glass"><img src={imagePath(card.index)} alt="" draggable="false" /></div></div>
          </div>
        ))}
      </div>

      <div className="hero-copy">
        <HeroText />
        <div className="create-wrapper">
          <a ref={buttonRef} className="create-button" href="https://luma.com/create" onMouseEnter={reveal} onMouseLeave={hide} onFocus={reveal} onBlur={hide}>Create Your First Event</a>
        </div>
        <div className="hero-discover"><a href="/discover">Discover Events <Arrow /></a></div>
        <div className="mobile-collage" aria-hidden="true">
          {HERO_COVER_ORDER.slice(0, 5).map((_, index) => <div className={`mobile-card mobile-card-${index + 1}`} key={index}><img src={imagePath(index)} alt="" draggable="false" /></div>)}
        </div>
      </div>

      <div className="hero-reveal" aria-hidden="true" inert>
        <div className="reveal-background" />
        {theme === 0 && <Starfield active={hovered} />}
        {theme === 1 && <div className="reveal-emoji">{['🪩', '✨', '💖', '🌸', '🎈', '🍒', '💫', '🥂', '🦋', '🌈', '🎉', '💕'].map((emoji, index) => <span key={index} style={{ left: `${(index * 31 + 8) % 95}%`, top: `${(index * 37 + 5) % 92}%`, '--float-delay': `${-index * 1.3}s` } as CSSProperties}>{emoji}</span>)}</div>}
        {theme === 2 && <div className="reveal-photos">{cards.map(card => <img key={card.index} src={imagePath(card.index, true)} alt="" style={{ left: card.left, top: card.top, width: card.size, height: card.size }} />)}</div>}
        <div className="hero-copy"><HeroText word={themes[theme]} decorative /></div>
      </div>
    </section>
  )
}
