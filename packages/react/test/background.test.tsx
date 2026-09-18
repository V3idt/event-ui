// @vitest-environment jsdom
import React, { StrictMode } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EventBackground } from '../src/index'

const engines = vi.hoisted(() => ({ instances: [] as Array<{
  resize: ReturnType<typeof vi.fn>
  render: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
}> }))

vi.mock('../src/backgrounds/life', () => ({
  createLife: () => {
    const renderer = { resize: vi.fn(), render: vi.fn(), dispose: vi.fn() }
    engines.instances.push(renderer)
    return renderer
  },
}))

describe('background animation lifecycle', () => {
  let frames: Map<number, FrameRequestCallback>
  let media: EventTarget & { matches: boolean }
  let resizeDisconnect: ReturnType<typeof vi.fn>
  let visibilityDisconnect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    engines.instances = []
    frames = new Map()
    let frameId = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++frameId, callback)
      return frameId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    media = Object.assign(new EventTarget(), { matches: false })
    vi.stubGlobal('matchMedia', () => media)
    resizeDisconnect = vi.fn()
    visibilityDisconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect = resizeDisconnect
    })
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      disconnect = visibilityDisconnect
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('pauses, follows reduced motion, and disposes every renderer through StrictMode and unmount', () => {
    const view = render(<StrictMode><EventBackground theme="life" paused /></StrictMode>)
    const active = engines.instances.at(-1)!
    expect(active.render).toHaveBeenCalled()
    expect(frames.size).toBe(0)
    expect(engines.instances.length).toBeGreaterThan(1)
    for (const stale of engines.instances.slice(0, -1)) {
      expect(stale.dispose).toHaveBeenCalledTimes(1)
    }

    view.rerender(<StrictMode><EventBackground theme="life" paused={false} /></StrictMode>)
    expect(frames.size).toBe(1)
    const previousDraws = active.render.mock.calls.length
    act(() => {
      const [id, callback] = [...frames.entries()][0]
      frames.delete(id)
      callback(100)
    })
    expect(active.render.mock.calls.length).toBeGreaterThan(previousDraws)
    expect(frames.size).toBe(1)

    act(() => {
      media.matches = true
      media.dispatchEvent(Object.assign(new Event('change'), { matches: true }))
    })
    expect(frames.size).toBe(0)
    // A consumer's explicit override wins over the operating-system preference.
    view.rerender(<StrictMode><EventBackground theme="life" reducedMotion={false} /></StrictMode>)
    expect(frames.size).toBe(1)

    view.unmount()
    expect(frames.size).toBe(0)
    for (const engine of engines.instances) expect(engine.dispose).toHaveBeenCalledTimes(1)
    expect(resizeDisconnect).toHaveBeenCalledTimes(engines.instances.length)
    expect(visibilityDisconnect).toHaveBeenCalledTimes(engines.instances.length)
    expect(document.querySelector('canvas')).toBeNull()
    const drawsAfterUnmount = active.render.mock.calls.length
    media.dispatchEvent(Object.assign(new Event('change'), { matches: false }))
    expect(frames.size).toBe(0)
    expect(active.render).toHaveBeenCalledTimes(drawsAfterUnmount)
  })
})
