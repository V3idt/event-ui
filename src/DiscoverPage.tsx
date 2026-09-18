import { useState } from 'react'
import { EventCard } from '@event-ui/react'
import { EventLink } from './EventPreviewProvider'
import { categories, communities } from './discovery-data'
import { allEvents, cityGroups, citySlug, eventCity, directoryCities, relativeEventDate, eventTags, eventTime, popularEvents, type EventRecord } from './event-data'
import { Icon, PageFooter, PageHeader, useSavedList } from './PageUI'

export function CompactEvent({ event }: { event: EventRecord }) {
  return <EventCard variant="compact" title={event.name} href={`/${event.slug}`} coverUrl={event.image}
    time={`${relativeEventDate(event)}, ${eventTime(event)}`} location={event.privateLocation ? undefined : event.location}
    renderLink={props => <EventLink {...props} event={event} sequence={popularEvents} />}
  />
}

export default function DiscoverPage() {
  const [continent, setContinent] = useState('Asia & Pacific')
  const followed = useSavedList('luma-followed-calendars')
  return <div className="inner-page discover-page"><PageHeader /><main className="discover-page-content">
    <h1>Discover Events</h1><p className="page-intro">Explore popular events near you, browse by category, or check out some of the great community calendars.</p>
    <section className="directory-section"><div className="section-heading"><h2>Popular Events<span className="heading-subtitle">Tokyo</span></h2><a className="small-pill" href="/tokyo">View All <Icon name="arrow" size={14} /></a></div><div className="compact-events">{popularEvents.map(event => <CompactEvent event={event} key={event.slug} />)}</div></section>
    <section className="directory-section"><h2>Browse by Category</h2><div className="directory-categories">{categories.map(category => { const slug = new URL(category.href).pathname; return <a href={slug} key={category.name} className="directory-category"><img src={category.image} alt="" /><div><strong>{category.name}</strong><span>{allEvents.filter(event => eventTags(event).includes(category.name)).length} Events</span></div></a> })}</div></section>
    <section className="directory-section"><h2>Featured Calendars</h2><div className="directory-calendars">{communities.map(community => <article className="calendar-card" key={community.name}><div className="calendar-card-top"><a href={community.href}><img src={community.image} alt="" /></a><button className={`small-pill ${followed.list.includes(community.name) ? 'selected' : ''}`} aria-pressed={followed.list.includes(community.name)} onClick={() => followed.toggle(community.name)}>{followed.list.includes(community.name) ? <><Icon name="check" size={13} /> Following</> : 'Follow'}</button></div><a href={community.href}><h3>{community.name}</h3><p>{community.description}</p></a></article>)}</div></section>
    <section className="directory-section"><h2>Explore Local Events</h2><div className="continent-tabs" role="tablist" aria-label="Continents">{Object.keys(cityGroups).map(name => <button key={name} role="tab" aria-selected={continent === name} aria-controls="city-directory" id={`continent-${citySlug(name)}`} onClick={() => setContinent(name)} className={continent === name ? 'active' : ''}>{name}</button>)}</div><div className="city-directory" id="city-directory" role="tabpanel" aria-labelledby={`continent-${citySlug(continent)}`}>{cityGroups[continent].map((city, index) => <a href={`/${citySlug(city)}`} key={city}><span className={`city-orb orb-${index % 5}`}>{<img src={directoryCities.find(item => item.name === city)?.icon} alt="" />}</span><div><strong>{city}</strong><span>{allEvents.filter(event => eventCity(event) === city).length} Events</span></div></a>)}</div></section>
  </main><PageFooter /></div>
}
