// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EventCard } from '../src/events/EventCard'
import { EventDetails, RegistrationCard } from '../src/events/EventDetails'
import { Button } from '../src/foundations'

afterEach(cleanup)

describe('event composition', () => {
  it('lets a preview adapter handle normal clicks while preserving native modified clicks', () => {
    const openPreview = vi.fn()
    const onClick = vi.fn()
    const { container } = render(<EventCard title="Community dinner" href="#dinner" coverUrl="/dinner.jpg" onClick={onClick} renderLink={({ onClick: cardClick, ...props }) => <a {...props} aria-haspopup="dialog" onClick={event => {
      cardClick?.(event)
      if (event.metaKey || event.ctrlKey || event.button !== 0 || event.defaultPrevented) return
      event.preventDefault()
      openPreview()
    }} />} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('#dinner')
    expect(container.querySelectorAll('a')).toHaveLength(1)
    expect(fireEvent.click(link)).toBe(false)
    expect(openPreview).toHaveBeenCalledOnce()
    expect(fireEvent.click(link, { ctrlKey: true })).toBe(true)
    expect(openPreview).toHaveBeenCalledOnce()
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('keeps cover and host actions from submitting a consumer form', () => {
    const onCoverClick = vi.fn()
    const onHostClick = vi.fn()
    const onSubmit = vi.fn(event => event.preventDefault())
    render(<form onSubmit={onSubmit}>
      <EventDetails title="Community dinner" coverUrl="/dinner.jpg" onCoverClick={onCoverClick}
        host={{ name: 'Alex', onClick: onHostClick }}
        date={{ month: 'Sep', day: 18, label: 'Friday, September 18', time: '6:00 PM' }}
        registration={{ description: 'Come join us.', action: <Button type="submit">Register</Button> }} />
    </form>)
    fireEvent.click(screen.getByRole('button', { name: 'View event cover' }))
    fireEvent.click(screen.getByRole('button', { name: 'Alex' }))
    expect(onCoverClick).toHaveBeenCalledOnce()
    expect(onHostClick).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('gives multiple registration cards distinct accessible headings', () => {
    render(<><RegistrationCard title="Dinner registration" action={<Button>Join dinner</Button>} /><RegistrationCard title="Workshop registration" action={<Button>Join workshop</Button>} /></>)
    const dinner = screen.getByRole('region', { name: 'Dinner registration' })
    const workshop = screen.getByRole('region', { name: 'Workshop registration' })
    expect(dinner.getAttribute('aria-labelledby')).not.toBe(workshop.getAttribute('aria-labelledby'))
  })
})
