'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { grainPalette, paletteColor } from './color'
import { createLife } from './life'
import { createWarp } from './warp'
import { createGrain } from './grain'
import type { BackgroundRenderer } from './renderer'
import './backgrounds.css'

export const implementedEventThemes = ['legacy', 'warp', 'life', 'grain-dark', 'grain-light'] as const
export type EventBackgroundTheme = typeof implementedEventThemes[number]
export interface EventBackgroundProps {
  /** Known themes autocomplete. Other names warn and render a static tint. */
  theme: EventBackgroundTheme | (string & {})
  /** A three- or six-digit hexadecimal color. */
  tint?: string
  mode?: 'fixed' | 'contained'
  appearance?: 'dark' | 'light'
  legacyStyle?: 'one-to-one' | 'classic'
  /** Reproducible particle placement for visual review and tests. */
  seed?: number
  /** Override only for controlled demos; omitted follows the OS setting. */
  reducedMotion?: boolean
  paused?: boolean
  className?: string
  style?: CSSProperties
  /** Optional repeating grain texture. Cross-origin URLs must allow CORS. */
  noiseTextureUrl?: string
}

export function eventBackgroundColor(theme: string, tint: string, dark = true, oneToOne = true) {
  if (theme === 'warp') return '#141516'
  if (theme.startsWith('grain-')) return grainPalette(tint, theme !== 'grain-light').background
  return paletteColor(tint, dark ? 'dark' : 'light', dark ? theme === 'legacy' && oneToOne ? 70 : 80 : 10)
}

/** A decorative, data-independent theme surface; place inside an isolated container. */
export function EventBackground({ theme, tint = '#151515', mode = 'fixed', appearance = 'dark', legacyStyle = 'one-to-one', seed = 1729, reducedMotion, paused = false, className = '', style, noiseTextureUrl }: EventBackgroundProps) {
  const surface = useRef<HTMLDivElement>(null)
  const controls = useRef({ paused, reducedMotion })
  const syncAnimation = useRef<(() => void) | null>(null)
  controls.current = { paused, reducedMotion }
  const animated = theme === 'warp' || theme === 'life' || theme === 'grain-dark' || theme === 'grain-light'
  const supported = implementedEventThemes.includes(theme as EventBackgroundTheme)
  const dark = appearance === 'dark'
  useEffect(() => { if (!supported) console.warn(`Event theme '${theme}' is not implemented; showing its tint surface.`) }, [theme, supported])
  useEffect(() => {
    const host = surface.current
    if (host) delete host.dataset.renderer
    if (!host || !animated) return
    // A fresh canvas per effect also makes WebGL's context type immutable safely
    // across theme switches and React StrictMode's setup/cleanup/setup cycle.
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas)
    let renderer: BackgroundRenderer | null = null
    try {
      renderer = theme === 'life' ? createLife(canvas, tint, dark, seed) : theme === 'warp' ? createWarp(canvas, tint, seed) : createGrain(canvas, tint, theme !== 'grain-light', noiseTextureUrl)
    } catch (error) {
      console.warn(`Unable to render event background '${theme}'.`, error)
    }
    if (!renderer) {
      host.dataset.renderer = 'fallback'
      host.dataset.motion = 'static'
      // Shader setup can fail after a context has allocated GPU resources.
      // Losing that context releases partial allocations before removing it.
      if (theme !== 'life') canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
      return
    }
    host.dataset.renderer = theme === 'life' ? 'canvas2d' : 'webgl'
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let systemReducedMotion = media.matches
    let frame = 0, last = 0, time = 0, visible = true, disposed = false
    const motionAllowed = () => !(controls.current.reducedMotion ?? (systemReducedMotion || media.matches)) && !controls.current.paused
    const canAnimate = () => motionAllowed() && visible && !document.hidden
    const draw = () => renderer!.render(time, 0)
    const tick = (now: number) => {
      frame = 0
      if (disposed) return
      if (!canAnimate()) { host.dataset.motion = 'paused'; last = 0; return }
      const delta = last ? Math.min(now - last, 64) : 0
      last = now; time += delta; renderer!.render(time, delta)
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      if (disposed) return
      cancelAnimationFrame(frame); frame = 0; last = 0
      host.dataset.motion = canAnimate() ? 'running' : 'paused'
      if (canAnimate()) frame = requestAnimationFrame(tick)
      else draw()
    }
    syncAnimation.current = sync
    const mediaChange = (event: MediaQueryListEvent) => { systemReducedMotion = event.matches; sync() }
    const resize = () => {
      const rect = host.getBoundingClientRect()
      renderer!.resize(Math.max(1, rect.width), Math.max(1, rect.height), theme === 'life' ? Math.min(window.devicePixelRatio || 1, 2) : 1.5)
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() })
    visibility.observe(host)
    canvas.addEventListener('background-ready', draw)
    document.addEventListener('visibilitychange', sync)
    media.addEventListener('change', mediaChange)
    resize(); sync()
    return () => {
      disposed = true; syncAnimation.current = null; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect()
      document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', mediaChange); canvas.removeEventListener('background-ready', draw)
      renderer?.dispose(); canvas.remove()
    }
  }, [theme, tint, animated, dark, seed, noiseTextureUrl])
  useEffect(() => { syncAnimation.current?.() }, [paused, reducedMotion])

  return <div ref={surface} aria-hidden="true" data-event-ui="background" data-theme={theme} data-supported={supported} data-motion={animated ? undefined : 'static'} className={`event-ui-background event-ui-background--${mode} ${animated ? 'event-ui-background--animated' : ''} ${className}`} style={{ '--event-background-color': eventBackgroundColor(theme, tint, dark, legacyStyle === 'one-to-one'), ...style } as CSSProperties} />
}
