import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './side-panel.css'

export interface SidePanelProps {
  open: boolean
  onClose: () => void
  label: string
  toolbar: ReactNode
  children: ReactNode
  className?: string
}

type PanelState = 'closed' | 'entering' | 'open' | 'closing'

// Reference-counted so two panels cannot unlock the page underneath each other.
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
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
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
      // Run after nested dialog cleanup, which may restore its own overflow value.
      queueMicrotask(() => {
        if (scrollLocks === 0) {
          restorePageScroll?.()
          restorePageScroll = undefined
        }
      })
    }
  }
}

/** Keep this component mounted while `open` changes to preserve its exit animation. */
export function SidePanel({ open, onClose, label, toolbar, children, className = '' }: SidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const releaseScroll = useRef<(() => void) | undefined>(undefined)
  const previousFocus = useRef<HTMLElement | null>(null)
  const backdropPointer = useRef(false)
  const onCloseRef = useRef(onClose)
  const requestedOpen = useRef(open)
  const [state, setState] = useState<PanelState>('closed')
  onCloseRef.current = onClose
  requestedOpen.current = open

  useLayoutEffect(() => {
    // Capture the element: React can clear the ref before unmount cleanup runs.
    const dialog = dialogRef.current
    return () => {
      dialog?.close()
      releaseScroll.current?.()
      releaseScroll.current = undefined
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
    }
  }, [])

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let firstFrame = 0
    let secondFrame = 0
    let closeTimer = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (open) {
      // Lock ownership is independent of the native dialog's open state. Strict
      // Mode replays setup and cleanup, and nested dialogs can change that state.
      releaseScroll.current ??= lockPageScroll()
      if (!dialog.open) {
        previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        setState(reducedMotion ? 'open' : 'entering')
        dialog.showModal()
        // Paint the offscreen position before starting the entrance transition.
        if (!reducedMotion) {
          firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(() => setState('open'))
          })
        }
      } else {
        // Reopening during the exit transition reverses it from its current position.
        setState('open')
      }
    } else if (dialog.open) {
      setState('closing')
      const duration = reducedMotion ? 0 : 300
      closeTimer = window.setTimeout(() => {
        dialog.close()
        setState('closed')
        releaseScroll.current?.()
        releaseScroll.current = undefined
        if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
      }, duration)
    }

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      clearTimeout(closeTimer)
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={`ui-side-panel ${className}`.trim()}
      data-state={state}
      onCancel={event => {
        if (event.target !== event.currentTarget) return
        event.preventDefault()
        onCloseRef.current()
      }}
      onClose={event => {
        if (event.target === event.currentTarget && !event.currentTarget.open && requestedOpen.current) onCloseRef.current()
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
      <div className="ui-side-panel-toolbar">{toolbar}</div>
      <div className="ui-side-panel-content">{children}</div>
    </dialog>,
    document.body,
  )
}
