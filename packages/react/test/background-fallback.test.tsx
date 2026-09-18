// @vitest-environment jsdom
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { EventBackground } from '../src/index'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('keeps event content usable when the browser cannot create a 2D canvas', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  const view = render(<main>
    <EventBackground theme="life" tint="#8358ce" />
    <button>Register for the event</button>
  </main>)

  expect(screen.getByRole('button', { name: 'Register for the event' })).toBeTruthy()
  expect(view.container.querySelector('canvas')).toBeNull()
  const background = view.container.querySelector('[data-event-ui="background"]') as HTMLElement
  expect(background.style.getPropertyValue('--event-background-color')).toMatch(/^#[a-f0-9]{6}$/i)
})
