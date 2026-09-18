// @vitest-environment jsdom
import React, { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EventPreview, SidePanel } from '../src/index'

// jsdom has no native dialog implementation. These tests cover our lifecycle
// around the platform API; browser testing must cover the native focus trap.
function installDialogPolyfill() {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute('open', '')
        this.querySelector<HTMLElement>('button:not([disabled]), a[href], input')?.focus()
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        if (!this.open) return
        this.removeAttribute('open')
        this.dispatchEvent(new Event('close'))
      },
    },
  })
}

async function finishClose() {
  await act(async () => {
    vi.advanceTimersByTime(400)
    await Promise.resolve()
  })
}

describe('controlled panels', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('scrollTo', vi.fn())
    installDialogPolyfill()
  })

  afterEach(async () => {
    cleanup()
    await Promise.resolve()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.removeAttribute('style')
  })

  it('hydrates a server-rendered open panel without mismatched markup', async () => {
    const tree = <main>
      <h1>Community events</h1>
      <SidePanel open label="Hydrated details" onClose={() => {}}>Event details</SidePanel>
    </main>
    const host = document.createElement('div')
    host.innerHTML = renderToString(tree)
    document.body.appendChild(host)
    const onRecoverableError = vi.fn()
    let root: ReturnType<typeof hydrateRoot>
    await act(async () => { root = hydrateRoot(host, tree, { onRecoverableError }) })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect((screen.getByRole('dialog', { name: 'Hydrated details' }) as HTMLDialogElement).open).toBe(true)
    await act(async () => root.unmount())
    expect(document.body.style.position).toBe('')
    host.remove()
  })

  it('restores page styles and the trigger after a StrictMode open, close, and reopen', async () => {
    document.body.style.cssText = 'position: relative; top: 3px; overflow: auto; padding-right: 11px;'
    const originalStyles = document.body.style.cssText
    const trigger = document.createElement('button')
    trigger.textContent = 'Open details'
    document.body.appendChild(trigger)
    trigger.focus()
    const onClose = vi.fn()
    const panel = (open: boolean) => <StrictMode>
      <SidePanel open={open} label="Details" onClose={onClose} style={{ transitionDuration: '700ms' }} toolbar={<button>Inside panel</button>}>
        Details
      </SidePanel>
    </StrictMode>
    const view = render(panel(true))
    expect(document.body.style.position).toBe('fixed')
    expect((screen.getByRole('dialog', { name: 'Details' }) as HTMLDialogElement).open).toBe(true)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inside panel' }))

    view.rerender(panel(false))
    expect(document.body.style.position).toBe('fixed')
    // Custom exit timing must finish before the native dialog and page unlock.
    await finishClose()
    expect(document.body.style.position).toBe('fixed')
    expect((screen.getByRole('dialog', { name: 'Details' }) as HTMLDialogElement).open).toBe(true)
    await finishClose()
    expect(document.body.style.cssText).toBe(originalStyles)
    expect(document.activeElement).toBe(trigger)

    view.rerender(panel(true))
    expect(document.body.style.position).toBe('fixed')
    view.unmount()
    await Promise.resolve()
    expect(document.body.style.cssText).toBe(originalStyles)
    expect(document.activeElement).toBe(trigger)
    expect(onClose).not.toHaveBeenCalled()
    trigger.remove()
  })

  it('keeps scrolling locked until the last nested panel closes', async () => {
    document.body.style.overflow = 'scroll'
    const panels = (outer: boolean, inner: boolean) => <SidePanel open={outer} label="Outer" onClose={() => {}} toolbar={<button>Outer action</button>}>
      <SidePanel open={inner} label="Inner" onClose={() => {}} toolbar={<button>Inner action</button>}>Inner content</SidePanel>
    </SidePanel>
    const view = render(panels(true, true))
    view.rerender(panels(true, false))
    await finishClose()
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.overflow).toBe('hidden')
    expect((screen.getByRole('dialog', { name: 'Outer' }) as HTMLDialogElement).open).toBe(true)

    view.rerender(panels(false, false))
    await finishClose()
    expect(document.body.style.position).toBe('')
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('releases its scroll lock when a native dialog form closes before controlled state updates', async () => {
    document.body.style.overflow = 'auto'
    const onClose = vi.fn()
    const panel = (open: boolean) => <SidePanel open={open} label="Native close" onClose={onClose}>
      <form method="dialog"><button>Done</button></form>
    </SidePanel>
    const view = render(panel(true))
    const dialog = screen.getByRole('dialog', { name: 'Native close' }) as HTMLDialogElement
    // Native method="dialog" forms invoke close() before the React callback.
    act(() => dialog.close())
    expect(onClose).toHaveBeenCalledTimes(1)
    view.rerender(panel(false))
    await Promise.resolve()
    expect(document.body.style.position).toBe('')
    expect(document.body.style.overflow).toBe('auto')
  })

  it('accepts translated labels and copy adapters while leaving open state consumer-owned', async () => {
    const onClose = vi.fn()
    const onCopyLink = vi.fn().mockResolvedValue(undefined)
    render(<EventPreview open title="Community dinner" href="/dinner" onClose={onClose} onCopyLink={onCopyLink}
      labels={{ dialog: 'Detalles del evento', close: 'Cerrar', copyLink: 'Copiar enlace', copied: 'Copiado', eventPage: 'Ver evento' }}>
      Event content
    </EventPreview>)
    const dialog = screen.getByRole('dialog', { name: 'Detalles del evento' }) as HTMLDialogElement
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' })) })
    expect(onCopyLink).toHaveBeenCalledWith(new URL('/dinner', window.location.href).href)
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver evento' }).getAttribute('href')).toBe('/dinner')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(dialog.open).toBe(true)

    const cancel = new Event('cancel', { cancelable: true })
    fireEvent(dialog, cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(dialog.open).toBe(true)
  })

  it('resets the scrolled preview when the consumer selects another event', () => {
    const onNext = vi.fn()
    const preview = (href: string, title: string) => <EventPreview open href={href} title={title} onClose={() => {}} onNext={onNext}>
      <article data-testid="event-content">{title}</article>
    </EventPreview>
    const view = render(preview('/first-event', 'First event'))
    const firstContent = screen.getByTestId('event-content')
    const scrollContainer = firstContent.parentElement!.parentElement!
    scrollContainer.scrollTop = 480
    fireEvent.click(screen.getByRole('button', { name: 'Next event' }))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('First event')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Previous event' }).hasAttribute('disabled')).toBe(true)

    view.rerender(preview('/second-event', 'Second event'))
    expect(scrollContainer.scrollTop).toBe(0)
    expect(screen.getByRole('dialog', { name: 'Event preview: Second event' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Event Page' }).getAttribute('href')).toBe('/second-event')
  })
})
