import { useEffect, useRef, useState, type ReactNode } from 'react'

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
    share: <><path d="M12 16V3m-5 5 5-5 5 5M5 12H3v9h18v-9h-2" /></>,
    heart: <path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 10 8 15 7-5 12-11 8-15Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    ticket: <path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z" />,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    chevron: <path d="m8 5 7 7-7 7" />,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.globe}</svg>
}

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
