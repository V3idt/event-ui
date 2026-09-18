import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { categories, communities, events, majorEvents } from './discovery-data';
import './discovery.css';
import { EventLink } from './EventPreviewProvider';
import { findEvent, popularEvents } from './event-data';

const cities = [
  { name: 'Tokyo', slug: 'tokyo' },
  { name: 'Bangkok', slug: 'bangkok' },
  { name: 'Singapore', slug: 'singapore' },
  { name: 'Seoul', slug: 'seoul' },
  { name: 'Sydney', slug: 'sydney' },
  { name: 'London', slug: 'london' },
  { name: 'Paris', slug: 'paris' },
  { name: 'Berlin', slug: 'berlin' },
  { name: 'New York', slug: 'nyc' },
  { name: 'San Francisco', slug: 'sf' },
  { name: 'Los Angeles', slug: 'los-angeles' },
];

function CitySelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const container = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <span className="discovery-city-selector" ref={container}>
      <button
        type="button"
        ref={trigger}
        className="discovery-city-trigger"
        aria-expanded={open}
        aria-controls="discovery-cities"
        onClick={() => { setOpen(!open); setQuery(''); }}
      >
        Tokyo
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.998 9.42a.75.75 0 0 0-.996 1.12l4.5 4a.75.75 0 0 0 .996 0l4.5-4a.75.75 0 0 0-.996-1.12L8 12.976zM12.002 6.56a.75.75 0 0 0 .996-1.12l-4.5-4a.75.75 0 0 0-.996 0l-4.5 4a.75.75 0 0 0 .996 1.12L8 3.002l4.002 3.556Z" />
        </svg>
      </button>
      {open && (
        <span className="discovery-city-popover" id="discovery-cities">
          <input
            ref={search}
            className="discovery-city-search"
            type="search"
            placeholder="Search cities"
            aria-label="Search cities"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                trigger.current?.focus();
              }
            }}
          />
          <span className="discovery-city-options">
            {cities.filter((city) => city.name.toLowerCase().includes(query.toLowerCase())).map((city) => (
              city.slug === 'tokyo' ? (
                <button className="discovery-city-option discovery-city-current" key={city.slug} type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>
                  {city.name}<span aria-hidden="true">✓</span>
                </button>
              ) : (
                <a className="discovery-city-option" key={city.slug} href={`/${city.slug}`}>
                  {city.name}<span aria-hidden="true">↗</span>
                </a>
              )
            ))}
            {!cities.some((city) => city.name.toLowerCase().includes(query.toLowerCase())) && <span className="discovery-city-empty">No matching cities</span>}
          </span>
          <a className="discovery-city-browse" href="/discover">Explore all cities <span aria-hidden="true">→</span></a>
        </span>
      )}
    </span>
  );
}

function GlowCard({ href, accent, className, children }: { href: string; accent?: string; className: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={`discovery-glow ${className}`}
      style={{ '--discovery-accent': accent ?? '#c9c9c9' } as CSSProperties}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--discovery-mouse-x', `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty('--discovery-mouse-y', `${event.clientY - bounds.top}px`);
      }}
    >
      {children}
    </a>
  );
}

export default function Discovery() {
  return (
    <div className="discovery" id="discover">
      <div className="discovery-container">
        <section className="discovery-section discovery-popular" aria-labelledby="discovery-popular-title">
          <h2 className="discovery-heading" id="discovery-popular-title" aria-label="Popular Events in Tokyo">Popular Events in <CitySelector /></h2>
          <div className="discovery-scroll">
            <div className="discovery-events">
              {events.map((event) => (
                <EventLink className="discovery-event" event={findEvent(new URL(event.href).pathname.slice(1))!} sequence={popularEvents} key={event.href}>
                  <img className="discovery-event-cover" src={event.image} alt="" loading="lazy" width="320" height="320" />
                  <div className="discovery-event-name discovery-clamp">{event.name}</div>
                  <div className="discovery-event-date">{event.date}</div>
                </EventLink>
              ))}
            </div>
          </div>
        </section>

        <section className="discovery-section" aria-labelledby="discovery-major-title">
          <h2 className="discovery-heading" id="discovery-major-title">Upcoming Major Events</h2>
          <div className="discovery-major-events">
            {majorEvents.map((event) => (
              <GlowCard href={event.href} accent={event.accent} className="discovery-major" key={event.href}>
                <img className="discovery-avatar" src={event.image} alt="" loading="lazy" width="40" height="40" />
                <div className="discovery-major-info">
                  <div className="discovery-major-name">{event.name}</div>
                  <div className="discovery-major-meta">{event.date} · {event.city}</div>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        <section className="discovery-section" aria-labelledby="discovery-communities-title">
          <h2 className="discovery-heading" id="discovery-communities-title">Explore Global Communities</h2>
          <div className="discovery-scroll discovery-community-scroll">
            <div className="discovery-communities">
              {communities.map((community) => (
                <GlowCard href={community.href} accent={community.accent} className="discovery-community" key={community.href}>
                  <img className="discovery-avatar" src={community.image} alt="" loading="lazy" width="48" height="48" />
                  <div className="discovery-community-name discovery-clamp">{community.name}</div>
                  <div className="discovery-community-description discovery-clamp">{community.description}</div>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="discovery-categories-title">
          <h2 className="discovery-heading" id="discovery-categories-title">Browse by Category</h2>
          <div className="discovery-categories">
            {categories.map((category) => (
              <GlowCard href={new URL(category.href).pathname} accent={category.accent} className="discovery-category" key={category.href}>
                <img className="discovery-category-icon" src={category.image} alt="" loading="lazy" width="40" height="40" />
                <div className="discovery-category-name">{category.name}</div>
              </GlowCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
