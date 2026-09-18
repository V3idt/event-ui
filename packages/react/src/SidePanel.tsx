'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useIsomorphicLayoutEffect } from './shared/useIsomorphicLayoutEffect'
import './side-panel.css'

export interface SidePanelProps {
  open: boolean
  onClose: () => void
  label: string
  toolbar?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties & { [token: `--event-ui-${string}`]: string | number | undefined }
  /** Defaults to document.body. The container must belong to the current document. */
  portalContainer?: Element | DocumentFragment
  toolbarClassName?: string
  contentClassName?: string
}

type PanelState = 'closed' | 'entering' | 'open' | 'closing'

// Reference-counted so overlapping panels cannot unlock each other's page.
let scrollLocks = 0
let restorePageScroll: (() => void) | undefined

function lockPageScroll() {
  if (scrollLocks++ === 0 && !restorePageScroll) {
    const body = document.body
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    const { scrollX, scrollY } = window
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    Object.assign(body.style, {
      position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`,
      width: '100%', overflow: 'hidden',
      paddingRight: scrollbar ? `${padding + scrollbar}px` : previous.paddingRight,
    })
    restorePageScroll = () => {
      Object.assign(body.style, previous)
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' })
    }
  }
  let released = false
  return () => {
    if (released) return
    released = true
    if (--scrollLocks === 0) {
      // Nested dialogs may restore their own overflow value during cleanup.
      queueMicrotask(() => {
        if (scrollLocks === 0) {
          restorePageScroll?.()
          restorePageScroll = undefined
        }
      })
    }
  }
}

function transitionDuration(dialog: HTMLDialogElement) {
  const computed = getComputedStyle(dialog)
  if (!computed.transitionDuration) return 300
  const milliseconds = (value: string) => {
    const time = Number.parseFloat(value)
    return Number.isFinite(time) ? time * (value.trim().endsWith('ms') ? 1 : 1000) : 0
  }
  const durations = computed.transitionDuration.split(',').map(milliseconds)
  const delays = computed.transitionDelay.split(',').map(milliseconds)
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index % delays.length] ?? 0)))
}

/** Keep mounted while `open` changes so the exit animation can finish. */
export function SidePanel({
  open, onClose, label, toolbar, children, className = '', style,
  portalContainer, toolbarClassName = '', contentClassName = '',
}: SidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const releaseScroll = useRef<(() => void) | undefined>(undefined)
  const previousFocus = useRef<HTMLElement | null>(null)
  const backdropPointer = useRef(false)
  const internalCloseEvents = useRef(new WeakMap<HTMLDialogElement, number>())
  const onCloseRef = useRef(onClose)
  const requestedOpen = useRef(open)
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PanelState>('closed')
  onCloseRef.current = onClose
  requestedOpen.current = open

  function closeDialog(dialog: HTMLDialogElement | null) {
    if (!dialog?.open) return
    internalCloseEvents.current.set(dialog, (internalCloseEvents.current.get(dialog) ?? 0) + 1)
    dialog.close()
  }

  // The first client render matches the empty server render, including open panels.
  useEffect(() => { setMounted(true) }, [])

  useIsomorphicLayoutEffect(() => {
    // React can clear the ref before unmount cleanup runs.
    const dialog = dialogRef.current
    return () => {
      closeDialog(dialog)
      releaseScroll.current?.()
      releaseScroll.current = undefined
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
    }
  }, [mounted, portalContainer])

  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let firstFrame = 0
    let secondFrame = 0
    let closeTimer = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (open) {
      releaseScroll.current ??= lockPageScroll()
      if (!dialog.open) {
        previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        setState(reducedMotion ? 'open' : 'entering')
        dialog.showModal()
        if (!reducedMotion) {
          firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(() => setState('open'))
          })
        }
      } else {
        // A quick reopen reverses the exit transition from its current position.
        setState('open')
      }
    } else if (dialog.open) {
      setState('closing')
      closeTimer = window.setTimeout(() => {
        closeDialog(dialog)
        setState('closed')
        releaseScroll.current?.()
        releaseScroll.current = undefined
        if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
      }, reducedMotion ? 0 : transitionDuration(dialog))
    } else if (releaseScroll.current) {
      // A consumer's <form method="dialog"> can close the native dialog first.
      setState('closed')
      releaseScroll.current()
      releaseScroll.current = undefined
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
    }

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      clearTimeout(closeTimer)
    }
  }, [mounted, open, portalContainer])

  if (!mounted) return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={`ui-side-panel ${className}`.trim()}
      style={style}
      data-state={state}
      onCancel={event => {
        if (event.target !== event.currentTarget) return
        event.preventDefault()
        onCloseRef.current()
      }}
      onClose={event => {
        if (event.target !== event.currentTarget) return
        const internalEvents = internalCloseEvents.current.get(event.currentTarget) ?? 0
        if (internalEvents > 0) {
          internalCloseEvents.current.set(event.currentTarget, internalEvents - 1)
          return
        }
        if (event.target === event.currentTarget && event.currentTarget === dialogRef.current
          && !event.currentTarget.open && requestedOpen.current) onCloseRef.current()
      }}
      onPointerDown={event => {
        const bounds = event.currentTarget.getBoundingClientRect()
        backdropPointer.current = event.target === event.currentTarget && (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        )
      }}
      onClick={event => {
        event.stopPropagation()
        if (backdropPointer.current && event.target === event.currentTarget) onCloseRef.current()
        backdropPointer.current = false
      }}
    >
      {toolbar != null && <div className={`ui-side-panel-toolbar ${toolbarClassName}`.trim()}>{toolbar}</div>}
      <div className={`ui-side-panel-content ${contentClassName}`.trim()}>{children}</div>
    </dialog>,
    portalContainer ?? document.body,
  )
}
