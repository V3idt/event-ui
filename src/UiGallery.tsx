import { useEffect, useState } from 'react'
import { TimelineEvent } from './BrowsePage'
import { EventLink } from './EventPreviewProvider'
import { allEvents, type EventRecord } from './event-data'
import { Icon } from './PageUI'
import { EventBackground } from './ui/backgrounds'
import './ui-gallery.css'

const themes = [
  { id: 'warp', label: 'Warp', slug: 'z6y1x5zv', description: 'Radial star trails', renderer: 'WebGL' },
  { id: 'life', label: 'Life', slug: 'l2tdcs1e', description: 'Evolving cellular grid', renderer: 'Canvas 2D' },
  { id: 'grain-dark', label: 'Grain', slug: 'july4-brooklyn', description: 'Moving color and texture', renderer: 'WebGL' },
  { id: 'legacy', label: 'Standard', slug: 'dhq3kyhy', description: 'Static event palette', renderer: 'CSS' },
] as const

type ThemeId = typeof themes[number]['id']
const themeEvents = themes.map(theme => allEvents.find(event => event.slug === theme.slug)).filter((event): event is EventRecord => Boolean(event))

export default function UiGallery() {
  const [themeId, setThemeId] = useState<ThemeId>('warp')
  const theme = themes.find(item => item.id === themeId)!
  const event = themeEvents.find(item => item.slug === theme.slug)!
  const [tint, setTint] = useState(event.tint)
  const [paused, setPaused] = useState(false)
  const [restart, setRestart] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const animated = themeId !== 'legacy'

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  function selectTheme(id: ThemeId) {
    const nextTheme = themes.find(item => item.id === id)!
    const nextEvent = themeEvents.find(item => item.slug === nextTheme.slug)!
    setThemeId(id)
    setTint(nextEvent.tint)
    setRestart(0)
  }

  const motionStatus = !animated ? 'Static background' : reducedMotion ? 'Reduced motion' : paused ? 'Animation paused' : 'Animation playing'

  return <div className="ui-gallery">
    <header className="gallery-header">
      <a className="gallery-brand" href="/" aria-label="Luma home"><img src="/assets/wordmark.svg" alt="Luma" /><span>UI library</span></a>
      <div className="gallery-header-actions"><span className="gallery-status">In development</span><a href="/discover">Explore the app <Icon name="arrow" size={15} /></a></div>
    </header>

    <main className="gallery-main">
      <div className="gallery-intro"><p className="gallery-eyebrow">Component playground</p><h1>A closer look at the details.</h1><p>Inspect the event backgrounds and preview interactions used in the app.</p></div>

      <section className="gallery-workbench" aria-labelledby="gallery-background-heading">
        <aside className="gallery-controls">
          <div className="gallery-control-heading"><h2 id="gallery-background-heading">Event backgrounds</h2><span>04</span></div>
          <div className="gallery-theme-options" role="group" aria-label="Background theme">
            {themes.map(item => <button type="button" key={item.id} aria-pressed={themeId === item.id} className={`gallery-theme-option ${themeId === item.id ? 'is-selected' : ''}`} onClick={() => selectTheme(item.id)}><span className={`gallery-theme-swatch gallery-theme-swatch--${item.id}`} aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.description}</small></span>{themeId === item.id && <Icon name="check" size={15} />}</button>)}
          </div>
          <div className="gallery-tint-control"><label htmlFor="gallery-tint">Tint color</label><div><input id="gallery-tint" type="color" value={tint} onChange={change => setTint(change.target.value)} /><code>{tint.toUpperCase()}</code><button type="button" onClick={() => setTint(event.tint)} disabled={tint.toLowerCase() === event.tint.toLowerCase()}>Reset</button></div></div>
          <dl className="gallery-properties"><div><dt>Renderer</dt><dd>{theme.renderer}</dd></div><div><dt>Seed</dt><dd>1729</dd></div><div><dt>Source</dt><dd>Event fixture</dd></div></dl>
          <p className="gallery-control-note">The same background component renders these scenes on event pages.</p>
        </aside>

        <div className="gallery-canvas-panel">
          <div className="gallery-canvas-toolbar"><div aria-live="polite"><span className={`gallery-motion-dot ${animated && !paused && !reducedMotion ? 'is-running' : ''}`} />{motionStatus}</div><div><button type="button" onClick={() => setPaused(value => !value)} disabled={!animated || reducedMotion} aria-pressed={paused} aria-label={paused ? 'Resume animation' : 'Pause animation'}>{paused ? <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="m4 2 9 6-9 6Z" /></svg> : <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h3v12H4zm5 0h3v12H9z" /></svg>}{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => setRestart(value => value + 1)} disabled={!animated} aria-label="Restart background animation"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6a5 5 0 1 1 .1 4M3 2v4h4" /></svg>Restart</button></div></div>
          <div className="gallery-stage" aria-label={`${theme.label} background example`}>
            <EventBackground key={`${themeId}-${restart}`} theme={themeId} tint={tint} mode="contained" paused={paused} reducedMotion={reducedMotion} seed={1729} />
            <span className="gallery-stage-label">{theme.label}<span>{tint.toLowerCase() === event.tint.toLowerCase() ? 'Reference tint' : 'Custom tint'}</span></span>
            <div className="gallery-stage-card"><TimelineEvent event={event} sequence={themeEvents} /></div>
            <span className="gallery-stage-hint">Select the event to open its preview <Icon name="arrow" size={14} /></span>
          </div>
          <div className="gallery-code"><code><span>&lt;EventBackground</span> theme="{themeId}" tint="{tint}" mode="contained" seed=&#123;1729&#125; <span>/&gt;</span></code></div>
        </div>
      </section>

      <section className="gallery-preview-section" aria-labelledby="gallery-preview-heading">
        <div><p className="gallery-eyebrow">Interaction study</p><h2 id="gallery-preview-heading">From an event to its details.</h2><p>Open the preview, move between these four events, and continue to the full page. The drawer uses the app’s actual event content.</p><div className="gallery-preview-actions"><EventLink event={event} sequence={themeEvents} className="ui-button primary">Open preview <Icon name="arrow" size={16} /></EventLink><a href={`/${event.slug}`} className="ui-button">Open event page</a></div><p className="gallery-small-note">Try Escape, browser Back, and the cover image dialog.</p></div>
        <div className="gallery-component-list" aria-label="Implemented preview components"><div><span>01</span><div><code>SidePanel</code><p>Motion, focus, and scroll containment</p></div><span className="gallery-component-state">Extracted</span></div><div><span>02</span><div><code>EventPreview</code><p>Toolbar, content, and event navigation</p></div><span className="gallery-component-state">Extracted</span></div><div><span>03</span><div><code>EventLink</code><p>Preview entry and native link behavior</p></div><span className="gallery-component-state">App adapter</span></div></div>
      </section>

      <section className="gallery-coverage" aria-labelledby="gallery-coverage-heading"><div><h2 id="gallery-coverage-heading">Fidelity is tracked, state by state.</h2><p>This gallery covers four captured event themes. Full theme coverage, reference comparisons, and package exports remain in progress.</p></div><div className="gallery-doc-reference"><span>Architecture & coverage plan</span><code>docs/UI-LIBRARY.md</code></div></section>
    </main>
    <footer className="gallery-footer"><span>Shared components. Visible progress.</span><a href="/">Back to homepage <Icon name="arrow" size={14} /></a></footer>
  </div>
}
