import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { eventCity, eventPrice, eventTags, formatDate, type EventRecord } from './event-data'
import { Icon, Modal, PageFooter, PageHeader, useSavedList } from './PageUI'

function WarpBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const ctx = element.getContext('2d')
    if (!ctx) return
    function draw() {
      if (!element || !ctx) return
      const w = element.clientWidth, h = element.clientHeight, dpr = Math.min(devicePixelRatio, 2)
      element.width = w * dpr; element.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#121416'; ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 160; i++) {
        const angle = i * 2.399963, length = Math.hypot(w, h), cx = w * .36, cy = h * .53
        const start = (i * 43 % 220) + 25, end = length * (.45 + (i % 11) / 20)
        const color = ['#5989d2', '#c16c46', '#afa87d', '#6b6a5b'][i % 4]
        const x = cx + Math.cos(angle) * start, y = cy + Math.sin(angle) * start
        const ex = cx + Math.cos(angle) * end, ey = cy + Math.sin(angle) * end
        const gradient = ctx.createLinearGradient(x, y, ex, ey); gradient.addColorStop(0, 'transparent'); gradient.addColorStop(.7, color + '38'); gradient.addColorStop(1, color + '80')
        ctx.strokeStyle = gradient; ctx.lineWidth = i % 5 === 0 ? 2 : .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke()
      }
    }
    const observer = new ResizeObserver(draw); observer.observe(element); draw()
    return () => observer.disconnect()
  }, [])
  return <canvas className="event-warp" ref={canvas} aria-hidden="true" />
}

function calendarFile(event: EventRecord) {
  const date = (value: string) => value.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Luma UI Demo//Events//EN', 'BEGIN:VEVENT', `UID:${event.slug}@luma-ui.local`, `DTSTAMP:${date(new Date().toISOString())}`, `DTSTART:${date(event.start)}`, `DTEND:${date(event.end)}`, `SUMMARY:${escape(event.name)}`, `LOCATION:${escape(event.privateLocation ? event.city : event.location)}`, `URL:https://luma.com/${event.slug}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(content)
}

export default function EventPage({ event }: { event: EventRecord }) {
  const [modal, setModal] = useState<'registration' | 'share' | 'cover' | 'host' | null>(null)
  const [complete, setComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState('')
  const saved = useSavedList('luma-saved-events')
  const isSaved = saved.list.includes(event.slug)
  const isPast = new Date(event.end) < new Date()
  const action = event.waitlist ? 'Join Waitlist' : event.approval ? 'Request to Join' : 'Get Ticket'
  const city = eventCity(event)
  const endTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: event.timezone, timeZoneName: 'short' }).format(new Date(event.end))
  const shareUrl = `${location.origin}/${event.slug}`
  useEffect(() => { document.title = `${event.name} · Luma` }, [event.name])
  async function copyLink() { try { await navigator.clipboard.writeText(shareUrl); setCopied(true) } catch { setCopied(false) } }
  function register(submit: FormEvent) { submit.preventDefault(); setComplete(true) }

  return <div className={`inner-page event-page event-theme-${event.theme}`} style={{ '--event-tint': event.tint, '--event-image': `url("${event.image}")` } as CSSProperties}>
    {event.theme === 'warp' ? <WarpBackdrop /> : <div className="event-backdrop" aria-hidden="true" />}
    <PageHeader />
    <main className="event-page-content"><aside className="event-sidebar"><button className="cover-button" onClick={() => setModal('cover')} aria-label="View event cover"><img src={event.image} alt={`Cover for ${event.name}`} /></button><div className="event-hosts"><div className="detail-section-label">Hosted By</div><button className="host-button" onClick={() => setModal('host')}>{event.hostAvatar ? <img src={event.hostAvatar} alt="" /> : <span className="host-placeholder">✦</span>}{event.host || 'Event host'}</button>{event.going > 0 && <><div className="detail-section-label">{event.going.toLocaleString()} Going</div><div className="guest-preview"><Icon name="users" size={22} /><span>Join the community</span></div></>}<button className="subtle-button" onClick={() => setModal('host')}>Contact the Host</button><a className="subtle-button" href={`https://luma.com/${event.slug}`}>View original event <Icon name="arrow" size={13} /></a><div className="sidebar-tags">{eventTags(event).map(tag => <a key={tag} href={`/${tag.toLowerCase().replace(' & culture', '').replace('food & drink', 'food')}`}>{tag}</a>)}</div></div></aside>
    <article className="event-details"><a className="featured-badge" href={city === 'Tokyo' ? '/tokyo' : city === 'New York' ? '/nyc' : '/discover'}>{city === 'Tokyo' && <img src="/assets/tokyo-icon.png" alt="" />}Featured in <strong>{city}</strong><Icon name="chevron" size={12} /></a><h1>{event.name}</h1><div className="event-facts"><a className="event-fact" href={calendarFile(event)} download={`${event.slug}.ics`} aria-label="Add event to calendar"><span className="date-icon"><small>{formatDate(event, { month: 'short' })}</small><span>{formatDate(event, { day: 'numeric' })}</span></span><span><strong>{formatDate(event, { weekday: 'long', month: 'long', day: 'numeric' })}</strong><small>{formatDate(event, { hour: 'numeric', minute: '2-digit' })} - {endTime}</small></span></a><a className="event-fact" href="#event-location"><span className="fact-icon"><Icon name={city === 'Online' ? 'globe' : 'pin'} size={23} /></span><span><strong>{event.privateLocation ? 'Register to See Address' : event.location}</strong><small>{event.city}{city === 'Online' ? ' event' : city === 'New York' ? ', United States' : ', Japan'}</small></span></a></div>
      <section className="registration-panel" aria-labelledby="registration-title"><div className="registration-heading" id="registration-title">Registration</div>{(event.waitlist || event.soldOut || isPast || event.approval) && <div className="registration-status"><span className="status-icon"><Icon name={isPast ? 'clock' : 'ticket'} size={18} /></span><div><strong>{isPast ? 'Past Event' : event.waitlist || event.soldOut ? 'Event Full' : 'Approval Required'}</strong><p>{isPast ? 'This event has ended.' : event.waitlist ? 'If you’d like, you can join the waitlist.' : event.soldOut ? 'All tickets have been reserved.' : 'Your registration is subject to approval by the host.'}</p></div></div>}<div className="registration-body"><p>{isPast ? 'Discover more events and find your next unforgettable experience.' : event.waitlist ? 'Please click on the button below to join the waitlist. You will be notified if additional spots become available.' : 'Welcome! To join the event, please register below.'}</p>{!event.free && <div className="ticket-price"><strong>General Admission</strong><span>{eventPrice(event)}</span></div>}{isPast || (event.soldOut && !event.waitlist) ? <a href="/discover" className="ui-button primary full-width">Discover Events</a> : <button className="ui-button primary full-width" onClick={() => { setModal('registration'); setComplete(false) }}>{action}</button>}</div></section>
      <div className="event-actions"><button className={`small-pill ${isSaved ? 'selected' : ''}`} aria-pressed={isSaved} onClick={() => saved.toggle(event.slug)}><Icon name={isSaved ? 'check' : 'heart'} size={15} />{isSaved ? 'Saved' : 'Save Event'}</button><button className="small-pill" onClick={() => { setModal('share'); setCopied(false) }}><Icon name="share" size={15} />Share</button><a className="small-pill" href={calendarFile(event)} download={`${event.slug}.ics`}><Icon name="calendar" size={15} />Add to Calendar</a></div>
      <section className="event-about"><h2 className="detail-section-label">About Event</h2>{event.description.length ? event.description.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Join {event.host || 'the community'} for {event.name}.</p>}<a className="text-link" href={`https://luma.com/${event.slug}`}>Read full event details <Icon name="arrow" size={15} /></a></section>
      <section id="event-location" className="event-location"><h2 className="detail-section-label">Location</h2><p>{event.privateLocation ? 'Please register to see the exact location of this event.' : event.location}</p><span className="muted">{event.city}</span>{city !== 'Online' && <a className="location-card" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.privateLocation ? event.city : event.location + ' ' + event.city)}`} target="_blank" rel="noreferrer"><span className="map-grid" /><span className="map-pin"><Icon name="pin" size={28} /></span><span className="map-label">{event.city}<small>View on Google Maps ↗</small></span></a>}</section>
    </article></main><PageFooter />
    {modal === 'cover' && <Modal title="Event cover" className="cover-modal" onClose={() => setModal(null)}><img className="large-cover" src={event.image} alt={event.name} /></Modal>}
    {modal === 'host' && <Modal title="Hosted By" onClose={() => setModal(null)}><div className="host-modal-content">{event.hostAvatar && <img src={event.hostAvatar} alt="" />}<h3>{event.host || 'Event host'}</h3><p className="muted">Contact the host through the original event page on Luma.</p><a className="ui-button primary" href={`https://luma.com/${event.slug}`}>Open on Luma <Icon name="arrow" size={16} /></a></div></Modal>}
    {modal === 'share' && <Modal title="Share Event" onClose={() => setModal(null)}><p className="muted">Bring your people along.</p><label className="form-label" htmlFor="share-url">Event link</label><div className="share-input"><input id="share-url" value={shareUrl} readOnly onFocus={e => e.target.select()} /><button className="ui-button primary" onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button></div><p className="text-sm muted">{copied ? 'Link copied to your clipboard.' : 'You can also select and copy the link above.'}</p></Modal>}
    {modal === 'registration' && <Modal title={complete ? 'Preview complete' : action} onClose={() => setModal(null)}>{complete ? <div className="confirmation"><Icon name="check" size={34} /><h3>Thanks{name ? `, ${name}` : ''}!</h3><p>Your {event.waitlist ? 'waitlist' : 'registration'} preview is complete. No registration or payment was sent to Luma.</p><button className="ui-button primary" onClick={() => setModal(null)}>Back to event</button></div> : <form className="modal-form" onSubmit={register}><div className="registration-event-summary"><img src={event.image} alt="" /><strong>{event.name}</strong></div><p className="preview-note">Preview only. This does not register you for the live event.</p><label htmlFor="attendee-name">Your name</label><input id="attendee-name" autoComplete="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required /><label htmlFor="attendee-email">Email</label><input id="attendee-email" type="email" autoComplete="email" placeholder="you@example.com" required /><div className="ticket-price"><span>{event.waitlist ? 'Waitlist' : 'General Admission'}</span><strong>{eventPrice(event)}</strong></div><button className="ui-button primary" type="submit">Preview {event.waitlist ? 'waitlist request' : 'registration'}</button></form>}</Modal>}
  </div>
}
