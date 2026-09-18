import { useState, type FormEvent } from 'react'
import { allEvents, cities, directoryCategories, directoryCities, eventCity, eventDate, eventPrice, eventTags, eventTime, type EventRecord } from './event-data'
import { EventLink } from './EventPreviewProvider'
import { categories } from './discovery-data'
import { Icon, Modal, PageFooter, PageHeader, useSavedList } from './PageUI'

export function TimelineEvent({ event, sequence }: { event: EventRecord; sequence?: readonly EventRecord[] }) {
  return <EventLink event={event} sequence={sequence} className="timeline-event"><div className="timeline-event-info"><span className="muted">{eventTime(event)}</span><h3>{event.name}</h3><p>{event.hostAvatar && <img src={event.hostAvatar} alt="" />} By {event.host || 'Event host'}</p><p><Icon name="pin" size={14} /> {event.location}</p><div className="event-badges">{event.waitlist && <span className="waitlist-badge">Waitlist</span>}{!event.waitlist && event.soldOut && <span>Sold Out</span>}{!event.free && <span>{eventPrice(event)}</span>}{event.going > 0 && <span><Icon name="users" size={13} /> {event.going} Going</span>}</div></div><img className="timeline-cover" src={event.image} alt="" loading="lazy" /></EventLink>
}

export default function BrowsePage({ city, category }: { city?: string; category?: string }) {
  const params = new URLSearchParams(location.search)
  const [query, setQuery] = useState(params.get('q') || '')
  const [place, setPlace] = useState(params.get('city') || city || '')
  const [freeOnly, setFreeOnly] = useState(params.get('free') === '1')
  const [savedOnly, setSavedOnly] = useState(params.get('saved') === '1')
  const [dateFilter, setDateFilter] = useState(params.get('date') || 'upcoming')
  const [subscribe, setSubscribe] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(Boolean(query))
  const saved = useSavedList('luma-saved-events')
  const categoryInfo = categories.find(item => item.name === category)
  const heading = category || city || 'Explore Events'
  const cityInfo = directoryCities.find(item => item.name === city)
  const categoryArtwork = directoryCategories.find(item => item.name === category)
  const results = allEvents.filter(event => {
    const matchesQuery = `${event.name} ${event.host} ${event.city} ${eventTags(event).join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const eventDay = new Date(event.start).toDateString()
    const now = new Date()
    return matchesQuery && (!place || eventCity(event) === place) && (!category || eventTags(event).includes(category)) && (!freeOnly || event.free) && (!savedOnly || saved.list.includes(event.slug)) && (dateFilter === 'all' || (dateFilter === 'upcoming' ? new Date(event.end) >= now : eventDay === now.toDateString()))
  }).sort((a, b) => a.start.localeCompare(b.start))
  const groups = results.reduce<Record<string, EventRecord[]>>((record, event) => { const key = formatDay(event); (record[key] ||= []).push(event); return record }, {})

  function updateFilters(values: Record<string, string>) {
    const next = new URLSearchParams(location.search)
    for (const [key, value] of Object.entries(values)) value ? next.set(key, value) : next.delete(key)
    history.replaceState(null, '', `${location.pathname}${next.size ? '?' + next : ''}`)
  }
  function resetFilters() { setQuery(''); setPlace(city || ''); setFreeOnly(false); setSavedOnly(false); setDateFilter('upcoming'); history.replaceState(null, '', location.pathname) }
  function submitSubscription(event: FormEvent) { event.preventDefault(); setSubscribed(true) }

  return <div className={`inner-page browse-page ${city === 'Tokyo' ? 'tokyo-page' : ''}`}><PageHeader />
    {category ? <section className="category-banner"><div><h1>{category}</h1><p className="muted">{allEvents.filter(event => eventTags(event).includes(category)).length} Events</p><p className="category-description">Find your people through {category.toLowerCase()} events, meetups, and shared experiences.</p><button className="ui-button primary rounded" onClick={() => { setSubscribe(true); setSubscribed(false) }}>Subscribe</button></div><img src={categoryArtwork?.hero} alt={`${category} events`} /></section> : city ? <section className={`browse-banner ${city === 'Tokyo' ? 'tokyo-banner' : ''}`} style={cityInfo && city !== 'Tokyo' ? { backgroundImage: `linear-gradient(90deg,${cityInfo.tint}bb,transparent 80%),url("${cityInfo.hero}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}><div className="browse-banner-content"><span className="banner-icon">{categoryInfo ? <img src={categoryInfo.image} alt="" /> : city === 'Tokyo' ? <img src="/assets/tokyo-icon.png" alt="" /> : <Icon name="globe" size={28} />}</span><h2>{city ? 'What’s Happening in' : 'Discover Events in'}</h2><h1>{heading}</h1><p className="banner-time"><Icon name="clock" size={16} />{city === 'Tokyo' ? new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'Find your people. Make a memory.'}</p><p className="banner-description">{city === 'Tokyo' ? 'Tokyo’s events span tech, culture, and innovation. The lively scene reflects the city’s blend of tradition and futuristic trends, offering diverse opportunities for learning and networking.' : `Discover ${category ? category.toLowerCase() + ' events' : 'events in ' + city}, meet new people, and find your next unforgettable experience.`}</p><button className="ui-button primary rounded" onClick={() => { setSubscribe(true); setSubscribed(false) }}>Subscribe <Icon name="arrow" size={15} /></button></div></section> : <div className="browse-search-heading"><h1>Explore Events</h1><p className="muted">Find something worth showing up for.</p></div>}
    <main className="browse-content"><div className="section-heading"><h2>Events</h2><div className="inline-actions"><a href="/discover" className="small-pill">All categories</a><button className="icon-button" aria-label="Search these events" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button></div></div>
      <div className="browse-filters">{(searchOpen || !city) && <div className="search-input"><Icon name="search" /><input aria-label="Search events" placeholder="Search events…" value={query} onChange={event => { setQuery(event.target.value); updateFilters({ q: event.target.value }) }} /></div>}<select aria-label="Filter by date" value={dateFilter} onChange={event => { setDateFilter(event.target.value); updateFilters({ date: event.target.value }) }}><option value="all">All dates</option><option value="upcoming">Upcoming</option><option value="today">Today</option></select>{!city && <select aria-label="Filter by city" value={place} onChange={event => { setPlace(event.target.value); updateFilters({ city: event.target.value }) }}><option value="">All locations</option>{['Tokyo', 'New York', 'Online', ...cities.filter(c => !['Tokyo', 'New York'].includes(c))].map(c => <option key={c}>{c}</option>)}</select>}<button className={`filter-pill ${freeOnly ? 'active' : ''}`} aria-pressed={freeOnly} onClick={() => { setFreeOnly(!freeOnly); updateFilters({ free: freeOnly ? '' : '1' }) }}>Free{freeOnly && <Icon name="check" size={13} />}</button><button className={`filter-pill ${savedOnly ? 'active' : ''}`} aria-pressed={savedOnly} onClick={() => { setSavedOnly(!savedOnly); updateFilters({ saved: savedOnly ? '' : '1' }) }}><Icon name="heart" size={14} /> Saved</button></div>
      <p className="results-count" aria-live="polite">{results.length} {results.length === 1 ? 'event' : 'events'}</p>
      {results.length ? <div className="event-timeline">{Object.entries(groups).map(([day, events]) => <section className="timeline-day" key={day}><div className="timeline-date"><strong>{day}</strong><span>{new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: events[0].timezone }).format(new Date(events[0].start))}</span></div><div className="timeline-cards">{events.map(event => <TimelineEvent event={event} sequence={results} key={event.slug} />)}</div></section>)}</div> : <div className="empty-state"><Icon name="search" size={36} /><h2>No events found</h2><p>Try another search, location, or category.</p><button className="ui-button" onClick={resetFilters}>Clear filters</button><a href="/discover" className="text-link">Explore all events <Icon name="arrow" size={16} /></a></div>}
    </main><PageFooter />
    {subscribe && <Modal title={`Subscribe to ${heading}`} onClose={() => setSubscribe(false)}>{subscribed ? <div className="confirmation"><Icon name="check" size={32} /><h3>Subscription preview complete</h3><p>No subscription was sent and no email will be delivered.</p><button className="ui-button primary" onClick={() => setSubscribe(false)}>Done</button></div> : <form className="modal-form" onSubmit={submitSubscription}><p className="muted">Preview the subscription experience. This local demo does not send emails.</p><label htmlFor="subscribe-email">Email</label><input id="subscribe-email" type="email" placeholder="you@example.com" required /><button className="ui-button primary" type="submit">Preview subscription</button></form>}</Modal>}
  </div>
}

function formatDay(event: EventRecord) {
  const now = new Date().toLocaleDateString('en-US', { timeZone: event.timezone })
  const day = new Date(event.start).toLocaleDateString('en-US', { timeZone: event.timezone })
  return day === now ? 'Today' : eventDate(event)
}
