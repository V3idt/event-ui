import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { EventBackground, EventPreview, SidePanel, implementedEventThemes, type EventBackgroundTheme } from '@event-ui/react'
import '@event-ui/react/styles.css'
import './styles.css'

const events = [
  { title: 'An evening of good ideas', category: 'Design & conversation', when: 'Friday · 6:30 PM', place: 'The Studio, Lisbon', description: 'Bring something you are making. Share a little, meet someone new, and leave with a fresh perspective.' },
  { title: 'Sunday, at a slower pace', category: 'Coffee & community', when: 'Sunday · 10:00 AM', place: 'Garden House, Lisbon', description: 'Good coffee, a shared table, and nowhere to rush. A small gathering for curious people.' },
]

function App() {
  const [theme, setTheme] = useState<EventBackgroundTheme>('warp')
  const [tint, setTint] = useState('#7357d6')
  const [paused, setPaused] = useState(false)
  const [preview, setPreview] = useState<number | null>(null)
  const [settings, setSettings] = useState(false)
  const event = events[preview ?? 0]
  const currentEvent = new URLSearchParams(window.location.search).get('event')
  const fullEvent = currentEvent === '1' || currentEvent === '2' ? events[Number(currentEvent) - 1] : null

  if (fullEvent) return <main className="full-event">
    <EventBackground theme="warp" tint="#7357d6" />
    <a className="back-link" href="./">← Component playground</a>
    <article className="full-event-card"><span className="eyebrow">{fullEvent.category}</span><h1>{fullEvent.title}</h1><p>{fullEvent.when}</p><p>{fullEvent.place}</p><p>{fullEvent.description}</p></article>
  </main>

  return <main>
    <nav><a className="wordmark" href="./"><span className="brand-mark">✳</span> event ui<span className="alpha">ALPHA</span></a><a href="#components">Components ↗</a></nav>
    <header><span className="eyebrow">A SMALL START. ROOM TO GROW.</span><h1>Make space for<br /><span>something good.</span></h1><p>Animated backgrounds. Thoughtful previews.<br />Three React components, ready to make your own.</p></header>

    <section className="background-demo" aria-label="Background preview">
      <EventBackground theme={theme} tint={tint} mode="contained" paused={paused} />
      <div className="surface-top"><span className="pill">EventBackground</span><span className="surface-caption">Live preview</span></div>
      <div className="surface-title"><span>YOUR NEXT GATHERING</span><h2>Set the atmosphere.</h2><p>One component. Five starting points.</p></div>
      <div className="surface-controls"><label>Theme<select value={theme} onChange={e => setTheme(e.target.value as EventBackgroundTheme)}>{implementedEventThemes.map(value => <option key={value}>{value}</option>)}</select></label><label className="color-label">Tint<input aria-label="Background tint" type="color" value={tint} onChange={e => setTint(e.target.value)} /></label><button aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button></div>
    </section>

    <section id="components" className="components"><div className="section-heading"><h2>Try the components</h2><span>01 — 03</span></div><div className="component-grid">
      <article className="component-card"><span className="component-number">02 / EVENT PREVIEW</span><div className="poster"><span>✳</span><strong>GOOD<br />IDEAS<br /><em>AFTER HOURS</em></strong></div><h3>{events[0].title}</h3><p>A preview before the full page. With navigation, copy link, and your content.</p><button className="primary" onClick={() => setPreview(0)}>Open event preview <span>↗</span></button></article>
      <article className="component-card panel-card"><span className="component-number">03 / SIDE PANEL</span><div className="panel-illustration" aria-hidden="true"><div className="mini-lines"><i /><i /><i /></div><div className="mini-panel"><span>✦</span><i /><i /><i /></div></div><h3>A little room on the side.</h3><p>A desktop side panel that becomes a bottom sheet on mobile. Fill it with anything.</p><button className="secondary" onClick={() => setSettings(true)}>Open side panel <span>↗</span></button></article>
    </div></section>

    <section className="code-section"><div><span className="eyebrow">START SMALL</span><h2>Your content.<br />Your configuration.</h2><p>Change the theme, labels, colors, and actions.<br />Keep the interaction details.</p></div><pre><code>{`import { EventBackground } from '@event-ui/react'\nimport '@event-ui/react/styles.css'\n\n<EventBackground\n  theme="${theme}"\n  tint="${tint}"\n  mode="contained"\n/>`}</code></pre></section>
    <footer><span>event ui <span className="muted">/ local alpha</span></span><span>Three components. One independent React app.</span></footer>

    <EventPreview open={preview !== null} onClose={() => setPreview(null)} title={event.title} href={`?event=${(preview ?? 0) + 1}`} onPrevious={preview === 1 ? () => setPreview(0) : undefined} onNext={preview === 0 ? () => setPreview(1) : undefined}>
      <article className="event-content"><div className="event-art"><span>✳</span><strong>{preview === 1 ? 'SLOW\nSUNDAY' : 'GOOD\nIDEAS'}</strong></div><span className="eyebrow">{event.category}</span><h2>{event.title}</h2><div className="event-detail"><span>◷</span><div><strong>{event.when}</strong><small>A little time well spent</small></div></div><div className="event-detail"><span>⌖</span><div><strong>{event.place}</strong><small>Everyone is welcome</small></div></div><div className="invitation"><strong>You are invited</strong><p>This example shows your own event content inside the reusable preview.</p></div><h3>About the gathering</h3><p>{event.description}</p><p>These are sample events. The library handles presentation; your app supplies data and actions.</p></article>
    </EventPreview>
    <SidePanel open={settings} onClose={() => setSettings(false)} label="Background settings" toolbar={<div className="settings-toolbar"><strong>Make it yours</strong><button onClick={() => setSettings(false)} aria-label="Close settings">✕</button></div>} style={{ '--event-ui-panel-width': '440px' }}>
      <div className="settings-content"><span className="eyebrow">SIDE PANEL</span><h2>Your controls.<br />Your space.</h2><p>This panel can hold a form, a conversation, or a little more detail.</p><label>Background theme<select value={theme} onChange={e => setTheme(e.target.value as EventBackgroundTheme)}>{implementedEventThemes.map(value => <option key={value}>{value}</option>)}</select></label><label>Background color<input type="color" value={tint} onChange={e => setTint(e.target.value)} /></label><button className="primary" onClick={() => setSettings(false)}>Done</button></div>
    </SidePanel>
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
