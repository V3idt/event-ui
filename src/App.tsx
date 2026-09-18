import Hero from './Hero'
import UiGallery from './UiGallery'
import LandingPage from './LandingPage'
import { EventPreviewProvider } from './EventPreviewProvider'
import { useEffect } from 'react'
import Discovery from './Discovery'
import Footer from './Footer'
import DiscoverPage from './DiscoverPage'
import BrowsePage from './BrowsePage'
import EventPage from './EventPage'
import { cityFromSlug, findEvent } from './event-data'
import { categories } from './discovery-data'
import Brand from '../examples/react/src/Brand'
import './pages.css'

export default function App() {
  return <EventPreviewProvider><AppRoutes /></EventPreviewProvider>
}

function AppRoutes() {
  const path = decodeURIComponent(location.pathname).replace(/\/$/, '') || '/'
  useEffect(() => {
    const event = findEvent(path.slice(1))
    const city = cityFromSlug(path.slice(1))
    const category = categories.find(item => new URL(item.href).pathname === path)
    document.title = path === '/' || path === '/ui' ? 'UI · React components' : event ? `${event.name} · Luma` : city ? `Events in ${city} · Luma` : category ? `${category.name} Events · Luma` : (path === '/discover' || path === '/discover/search') ? 'Discover Events · Luma' : path === '/demo' ? 'Luma — Delightful events start here' : 'Page not found · UI'
  }, [path])
  if (path === '/' && !new URLSearchParams(location.search).has('event')) return <LandingPage />
  if (path === '/' || path === '/ui') return <UiGallery />
  if (path === '/discover') return <DiscoverPage />
  if (path === '/discover/search') return <BrowsePage />
  const event = findEvent(path.slice(1))
  if (event) return <EventPage event={event} />
  const city = cityFromSlug(path.slice(1))
  if (city) return <BrowsePage city={city} />
  const category = categories.find(item => new URL(item.href).pathname === path)
  if (category) return <BrowsePage category={category.name} />
  if (path !== '/demo') return <div className="home home-not-found"><header className="home-header"><a className="home-brand" href="/" aria-label="UI home"><Brand /></a><nav aria-label="Main navigation"><a href="/ui">Components</a></nav></header><main className="home-not-found-content"><span className="home-kicker">404</span><h1>Nothing here yet.</h1><p>This page could not be found.</p><a className="home-browse" href="/">Back to home</a></main></div>
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
