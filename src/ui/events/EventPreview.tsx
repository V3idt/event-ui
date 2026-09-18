import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { SidePanel } from '../SidePanel'
import './event-preview.css'

export interface EventPreviewProps {
  open: boolean
  title: string
  href: string
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  children: ReactNode
}

function Symbol({ name }: { name: 'close' | 'copy' | 'external' | 'up' | 'down' }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'close' ? <><path className="preview-close-desktop" d="m13 17 5-5-5-5M6 17l5-5-5-5" /><path className="preview-close-mobile" d="m6 6 12 12M6 18 18 6" /></> : name === 'copy' ? <><rect x="8" y="8" width="13" height="13" rx="4" /><path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" /></> : name === 'external' ? <path d="M7 17 17 7M7 7h10v10" /> : <path d={name === 'up' ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />}
  </svg>
}

/** Controlled presentation only: the consumer owns selection, URLs, and event content. */
export function EventPreview({ open, title, href, onClose, onPrevious, onNext, children }: EventPreviewProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const body = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { if (open && body.current?.parentElement) body.current.parentElement.scrollTop = 0 }, [href, open])
  useEffect(() => { setCopyState('idle') }, [href, open])
  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 2200)
    return () => clearTimeout(timer)
  }, [copyState])
  async function copy() {
    try { await navigator.clipboard.writeText(new URL(href, location.href).href); setCopyState('copied') }
    catch { setCopyState('failed') }
  }
  return <SidePanel open={open} onClose={onClose} label={`Event preview: ${title}`} className="event-preview" toolbar={<>
    <button type="button" className="preview-toolbar-button preview-close" onClick={onClose} aria-label="Close event preview"><Symbol name="close" /></button>
    <div className="preview-toolbar-links">
      <button type="button" className="preview-toolbar-button" onClick={copy}><Symbol name="copy" /><span aria-live="polite">{copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy Link'}</span></button>
      <a className="preview-toolbar-button" href={href} target="_blank" rel="noreferrer">Event Page <Symbol name="external" /></a>
    </div>
    <div className="preview-toolbar-pagination">
      <button type="button" className="preview-toolbar-button" aria-label="Previous event" disabled={!onPrevious} onClick={onPrevious}><Symbol name="up" /></button>
      <button type="button" className="preview-toolbar-button" aria-label="Next event" disabled={!onNext} onClick={onNext}><Symbol name="down" /></button>
    </div>
  </>}>
    <div key={href} ref={body} className="preview-event-body">{children}</div>
  </SidePanel>
}
