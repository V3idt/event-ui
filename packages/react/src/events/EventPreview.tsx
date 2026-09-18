'use client'

import { useEffect, useRef, useState, type HTMLAttributeAnchorTarget } from 'react'
import { SidePanel, type SidePanelProps } from '../SidePanel'
import { useIsomorphicLayoutEffect } from '../shared/useIsomorphicLayoutEffect'
import './event-preview.css'

export interface EventPreviewLabels {
  dialog: string
  close: string
  copyLink: string
  copied: string
  copyFailed: string
  eventPage: string
  previous: string
  next: string
}

export interface EventPreviewProps extends Omit<SidePanelProps, 'label' | 'toolbar'> {
  title: string
  href: string
  onPrevious?: () => void
  onNext?: () => void
  labels?: Partial<EventPreviewLabels>
  /** Override the browser clipboard implementation. Receives an absolute URL. */
  onCopyLink?: (url: string) => void | Promise<void>
  /** Optional alternative when copying fails or the Clipboard API is unavailable. */
  copyFallback?: (url: string, error: unknown) => void | Promise<void>
  onCopyError?: (error: unknown) => void
  eventLinkTarget?: HTMLAttributeAnchorTarget
  eventLinkRel?: string
}

function Symbol({ name }: { name: 'close' | 'copy' | 'external' | 'up' | 'down' }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'close' ? <><path className="preview-close-desktop" d="m13 17 5-5-5-5M6 17l5-5-5-5" /><path className="preview-close-mobile" d="m6 6 12 12M6 18 18 6" /></> : name === 'copy' ? <><rect x="8" y="8" width="13" height="13" rx="4" /><path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" /></> : name === 'external' ? <path d="M7 17 17 7M7 7h10v10" /> : <path d={name === 'up' ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />}
  </svg>
}

/** Controlled presentation: the consumer owns selection, URLs, and event content. */
export function EventPreview({
  open, title, href, onClose, onPrevious, onNext, children, labels,
  onCopyLink, copyFallback, onCopyError, eventLinkTarget = '_blank', eventLinkRel,
  className = '', ...panelProps
}: EventPreviewProps) {
  const text: EventPreviewLabels = {
    dialog: `Event preview: ${title}`, close: 'Close event preview', copyLink: 'Copy Link',
    copied: 'Copied!', copyFailed: 'Copy failed', eventPage: 'Event Page',
    previous: 'Previous event', next: 'Next event', ...labels,
  }
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const body = useRef<HTMLDivElement>(null)
  const copyRequest = useRef(0)
  useIsomorphicLayoutEffect(() => {
    if (open && body.current?.parentElement) body.current.parentElement.scrollTop = 0
  }, [href, open])
  useEffect(() => {
    setCopyState('idle')
    return () => { copyRequest.current += 1 }
  }, [href, open])
  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 2200)
    return () => clearTimeout(timer)
  }, [copyState])

  async function copy() {
    const request = ++copyRequest.current
    try {
      const url = new URL(href, window.location.href).href
      try {
        if (onCopyLink) await onCopyLink(url)
        else await navigator.clipboard.writeText(url)
      } catch (error) {
        if (!copyFallback) throw error
        await copyFallback(url, error)
      }
      if (request === copyRequest.current) setCopyState('copied')
    } catch (error) {
      if (request === copyRequest.current) {
        setCopyState('failed')
        onCopyError?.(error)
      }
    }
  }

  return <SidePanel {...panelProps} open={open} onClose={onClose} label={text.dialog} className={`event-preview ${className}`.trim()} toolbar={<>
    <button type="button" className="preview-toolbar-button preview-close" onClick={onClose} aria-label={text.close}><Symbol name="close" /></button>
    <div className="preview-toolbar-links">
      <button type="button" className="preview-toolbar-button" onClick={copy}><Symbol name="copy" /><span aria-live="polite">{copyState === 'copied' ? text.copied : copyState === 'failed' ? text.copyFailed : text.copyLink}</span></button>
      <a className="preview-toolbar-button" href={href} target={eventLinkTarget} rel={eventLinkRel ?? (eventLinkTarget === '_blank' ? 'noopener noreferrer' : undefined)}>{text.eventPage} <Symbol name="external" /></a>
    </div>
    <div className="preview-toolbar-pagination">
      <button type="button" className="preview-toolbar-button" aria-label={text.previous} disabled={!onPrevious} onClick={onPrevious}><Symbol name="up" /></button>
      <button type="button" className="preview-toolbar-button" aria-label={text.next} disabled={!onNext} onClick={onNext}><Symbol name="down" /></button>
    </div>
  </>}>
    <div key={href} ref={body} className="preview-event-body">{children}</div>
  </SidePanel>
}
