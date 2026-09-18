import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@event-ui/react'
export { Icon } from '@event-ui/react'

export function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; dialog?.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} aria-label={title} className={`ui-modal ${className}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>
}

export function PageHeader() {
  const [search, setSearch] = useState(false)
  const [time, setTime] = useState(new Date())
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(timer) }, [])
  return <>
    <header className="page-header"><a href="/" aria-label="Luma Home"><img className="page-wordmark" src="/assets/wordmark.svg" alt="Luma" /></a><nav aria-label="Main navigation"><span className="header-clock">{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</span><button className="icon-button" aria-label="Search events" onClick={() => setSearch(true)}><Icon name="search" /></button><a href="/discover">Discover Events</a><a className="small-pill" href="https://luma.com/signin">Sign In</a></nav></header>
    {search && <Modal title="Find your next event" onClose={() => setSearch(false)}><form action="/discover/search" className="search-form"><label htmlFor="global-search">Search events</label><div className="search-input"><Icon name="search" /><input id="global-search" name="q" placeholder="Events, hosts, or places" autoFocus required /><button className="ui-button primary" type="submit">Search</button></div></form></Modal>}
  </>
}

export function PageFooter() {
  return <footer className="compact-footer"><div><a href="/" aria-label="Luma Home">✦</a><a href="/discover">Discover</a><a href="https://luma.com/pricing">Pricing</a><a href="https://help.luma.com">Help</a></div><div><a href="mailto:support@luma.com" aria-label="Contact Luma">✉</a><a className="outline-pill" href="https://luma.com/app">Get the App</a></div></footer>
}

export function useSavedList(key: string) {
  const [list, setList] = useState<string[]>(() => {
    try { const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [] } catch { return [] }
  })
  function toggle(value: string) {
    setList(previous => { const next = previous.includes(value) ? previous.filter(item => item !== value) : [...previous, value]; try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* Session-only state if storage is unavailable. */ } return next })
  }
  return { list, toggle }
}
