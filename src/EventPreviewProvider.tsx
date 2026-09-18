import { createContext, useCallback, useContext, useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { allEvents, findEvent, type EventRecord } from './event-data'
import EventPage from './EventPage'
import { EventPreview } from './ui/events/EventPreview'

type PreviewSelection = { event: EventRecord; sequence: readonly EventRecord[] }
const PreviewContext = createContext<(event: EventRecord, sequence?: readonly EventRecord[]) => void>(() => {})
const selectionFromUrl = (): PreviewSelection | null => {
  const event = findEvent(new URLSearchParams(location.search).get('e') || '')
  const slugs: unknown = history.state?.eventPreviewSequence
  const sequence = Array.isArray(slugs) ? slugs.map(slug => typeof slug === 'string' ? findEvent(slug) : undefined).filter((item): item is EventRecord => Boolean(item)) : allEvents
  return event ? { event, sequence: sequence.some(item => item.slug === event.slug) ? sequence : allEvents } : null
}

export function EventPreviewProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<PreviewSelection | null>(selectionFromUrl)
  const retained = useRef<PreviewSelection | null>(selection)
  const returnUrl = useRef('')
  const pushed = useRef(Boolean(history.state?.eventPreview))
  if (selection) retained.current = selection
  const open = useCallback((event: EventRecord, sequence: readonly EventRecord[] = allEvents) => {
    const url = new URL(location.href)
    const state = { ...history.state, eventPreview: true, eventPreviewSequence: sequence.map(item => item.slug) }
    if (!url.searchParams.has('e')) {
      returnUrl.current = url.pathname + url.search + url.hash
      url.searchParams.set('e', event.slug)
      history.pushState(state, '', url)
      pushed.current = true
    } else {
      url.searchParams.set('e', event.slug)
      history.replaceState(state, '', url)
    }
    setSelection({ event, sequence })
  }, [])
  const close = useCallback(() => {
    setSelection(null)
    if (pushed.current && history.state?.eventPreview) {
      pushed.current = false
      history.back()
    } else {
      const url = new URL(location.href)
      url.searchParams.delete('e')
      history.replaceState({ ...history.state, eventPreview: false, eventPreviewSequence: undefined }, '', returnUrl.current || url.pathname + url.search + url.hash)
    }
  }, [])
  useEffect(() => {
    const onHistory = () => { pushed.current = Boolean(history.state?.eventPreview); setSelection(selectionFromUrl()) }
    window.addEventListener('popstate', onHistory)
    return () => window.removeEventListener('popstate', onHistory)
  }, [])
  const current = selection || retained.current
  const index = current?.sequence.findIndex(event => event.slug === current.event.slug) ?? -1
  return <PreviewContext.Provider value={open}>{children}{current && <EventPreview
    open={Boolean(selection)} title={current.event.name} href={`/${current.event.slug}`} onClose={close}
    onPrevious={index > 0 ? () => open(current.sequence[index - 1], current.sequence) : undefined}
    onNext={index >= 0 && index < current.sequence.length - 1 ? () => open(current.sequence[index + 1], current.sequence) : undefined}
  ><EventPage key={current.event.slug} event={current.event} presentation="preview" active={Boolean(selection)} /></EventPreview>}</PreviewContext.Provider>
}

/** Keeps native links working for modifier clicks, new tabs, and non-JavaScript navigation. */
export function EventLink({ event, sequence, children, onClick, ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { event: EventRecord; sequence?: readonly EventRecord[]; children: ReactNode }) {
  const open = useContext(PreviewContext)
  return <a {...props} href={`/${event.slug}`} aria-haspopup="dialog" onClick={click => {
    onClick?.(click)
    if (click.defaultPrevented || click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey || props.target === '_blank') return
    click.preventDefault()
    open(event, sequence)
  }}>{children}</a>
}
