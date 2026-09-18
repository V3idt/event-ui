// @vitest-environment node
import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EventBackground, EventPreview, SidePanel } from '../src/index'

describe('server rendering', () => {
  it('renders the decorative surface and defers modal portals without browser globals', () => {
    expect(typeof document).toBe('undefined')
    expect(typeof window).toBe('undefined')

    const html = renderToString(<main>
      <EventBackground theme="life" tint="#785af0" mode="contained" />
      <SidePanel open label="Details" onClose={() => {}} toolbar={<button>Close</button>}>
        <p>Panel content</p>
      </SidePanel>
      <EventPreview open title="Community dinner" href="/dinner" onClose={() => {}}>
        <p>Event content</p>
      </EventPreview>
    </main>)

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('data-theme="life"')
    expect(html).not.toContain('<dialog')
    expect(html).not.toContain('<canvas')
  })
})
