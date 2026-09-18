import Hero from './Hero'
import { useEffect } from 'react'
import Discovery from './Discovery'
import Footer from './Footer'
import DiscoverPage from './DiscoverPage'
import BrowsePage from './BrowsePage'
import EventPage from './EventPage'
import { cityFromSlug, findEvent } from './event-data'
import { categories } from './discovery-data'
import { PageFooter, PageHeader } from './PageUI'
import './pages.css'

export default function App() {
  const path = decodeURIComponent(location.pathname).replace(/\/$/, '') || '/'
  useEffect(() => {
    const event = findEvent(path.slice(1))
    const city = cityFromSlug(path.slice(1))
    const category = categories.find(item => new URL(item.href).pathname === path)
    document.title = event ? `${event.name} · Luma` : city ? `Events in ${city} · Luma` : category ? `${category.name} Events · Luma` : path.startsWith('/discover') ? 'Discover Events · Luma' : 'Luma — Delightful events start here'
  }, [path])
  if (path === '/discover') return <DiscoverPage />
  if (path === '/discover/search') return <BrowsePage />
  const event = findEvent(path.slice(1))
  if (event) return <EventPage event={event} />
  const city = cityFromSlug(path.slice(1))
  if (city) return <BrowsePage city={city} />
  const category = categories.find(item => new URL(item.href).pathname === path)
  if (category) return <BrowsePage category={category.name} />
  if (path !== '/') return <div className="inner-page"><PageHeader /><main className="empty-state"><h1>Page not found</h1><p>This page isn’t available.</p><a className="ui-button primary" href="/discover">Discover Events</a></main><PageFooter /></div>
  return (
    <div className="page">
      <main>
        <Hero />
        <Discovery />
      </main>
      <Footer />
    </div>
  )
}
