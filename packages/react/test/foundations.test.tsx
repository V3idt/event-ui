// @vitest-environment jsdom
import { createRef, useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Avatar, Button, Checkbox, Field, Input, Switch, Tabs, Textarea } from '../src/foundations'

afterEach(cleanup)

describe('foundation controls', () => {
  it('associates field labels, descriptions, and errors without consumer IDs', () => {
    const ref = createRef<HTMLInputElement>()
    render(<form>
      <Field label="Email address" description="For your ticket." error="Enter a valid email." required><Input ref={ref} name="email" type="email" /></Field>
      <Field label="Note" description="Optional message"><Textarea /></Field>
    </form>)
    const email = screen.getByRole('textbox', { name: 'Email address' }) as HTMLInputElement
    expect(ref.current).toBe(email)
    expect(email.required).toBe(true)
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(email.getAttribute('aria-describedby')?.split(' ').map(id => document.getElementById(id)?.textContent)).toEqual(['For your ticket.', 'Enter a valid email.'])
    const note = screen.getByRole('textbox', { name: 'Note' })
    expect(note.id).not.toBe(email.id)
    expect(document.getElementById(note.getAttribute('aria-describedby')!)?.textContent).toBe('Optional message')
  })

  it('keeps native checkbox and switch form behavior, keyboard interaction, and refs', async () => {
    const user = userEvent.setup()
    const checkboxRef = createRef<HTMLInputElement>()
    render(<form data-testid="form">
      <Checkbox ref={checkboxRef} name="updates" value="yes" label="Email updates" description="One message a week." />
      <Switch name="reminders" value="yes" label="Event reminders" defaultChecked />
    </form>)
    const checkbox = screen.getByRole('checkbox', { name: 'Email updates' }) as HTMLInputElement
    expect(checkboxRef.current).toBe(checkbox)
    await user.tab()
    expect(document.activeElement).toBe(checkbox)
    await user.keyboard(' ')
    expect(checkbox.checked).toBe(true)
    await user.tab()
    const reminder = screen.getByRole('switch', { name: 'Event reminders' }) as HTMLInputElement
    expect(document.activeElement).toBe(reminder)
    await user.keyboard(' ')
    expect(reminder.checked).toBe(false)
    expect([...new FormData(screen.getByTestId('form') as HTMLFormElement)]).toEqual([['updates', 'yes']])
  })

  it('blocks duplicate loading actions and forwards native button props', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    const view = render(<Button ref={ref} type="submit" loading loadingLabel="Joining…" onClick={clicked}>Join event</Button>)
    const button = screen.getByRole('button', { name: 'Joining…' }) as HTMLButtonElement
    expect(ref.current).toBe(button)
    expect(button.disabled).toBe(true)
    expect(button.type).toBe('submit')
    expect(button.getAttribute('aria-busy')).toBe('true')
    await user.click(button)
    expect(clicked).not.toHaveBeenCalled()
    view.rerender(<Button onClick={clicked}>Join event</Button>)
    await user.click(screen.getByRole('button', { name: 'Join event' }))
    expect(clicked).toHaveBeenCalledOnce()
  })

  it('shows the avatar fallback after an image failure and retries a different source', () => {
    const view = render(<Avatar src="/unavailable.jpg" alt="Alex Chen" />)
    const avatar = screen.getByRole('img', { name: 'Alex Chen' })
    expect(screen.getAllByRole('img')).toEqual([avatar])
    fireEvent.error(avatar.querySelector('img')!)
    expect(avatar.textContent).toBe('AC')
    expect(screen.getAllByRole('img')).toEqual([avatar])
    view.rerender(<Avatar src="/alex.jpg" alt="Alex Chen" />)
    expect(avatar.querySelector('img')?.getAttribute('src')).toBe('/alex.jpg')
  })
})

describe('tabs', () => {
  it('roves focus, skips disabled tabs, and connects the visible panel', async () => {
    const user = userEvent.setup()
    function Example() {
      const [value, setValue] = useState('upcoming')
      return <Tabs aria-label="Event view" value={value} onValueChange={setValue} items={[
        { value: 'upcoming', label: 'Upcoming', content: 'Next events' },
        { value: 'private', label: 'Private', disabled: true, content: 'Private events' },
        { value: 'past', label: 'Past', content: 'Previous events' },
      ]} />
    }
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Upcoming' }))
    await user.keyboard('{ArrowRight}')
    const past = screen.getByRole('tab', { name: 'Past' })
    expect(document.activeElement).toBe(past)
    expect(past.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Previous events')
    expect(screen.getByRole('tabpanel').id).toBe(past.getAttribute('aria-controls'))
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Upcoming' }))
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(past)
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Upcoming' }))
  })

  it('calls controlled selection without changing ownership of its value', () => {
    const onValueChange = vi.fn()
    render(<Tabs aria-label="Locations" value="all" onValueChange={onValueChange} items={[{ value: 'all', label: 'All' }, { value: 'online', label: 'Online' }]} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Online' }))
    expect(onValueChange).toHaveBeenCalledWith('online')
    expect(screen.getByRole('tab', { name: 'All' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Online' }).getAttribute('aria-selected')).toBe('false')
  })
})
