// @vitest-environment jsdom
import React, { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DropdownMenu, Select } from '../src/dropdowns'

afterEach(() => cleanup())

describe('DropdownMenu', () => {
  it('keeps an icon-only trigger labelled and keyboard-operable when its chevron is hidden', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DropdownMenu label={<span aria-hidden="true">⋯</span>} aria-label="More event actions" showChevron={false}
      items={[{ id: 'save', label: 'Save event', onSelect }]} />)
    const trigger = screen.getByRole('button', { name: 'More event actions' })
    expect(trigger.querySelector('.eui-dropdown-chevron')).toBeNull()
    trigger.focus()
    await user.keyboard('{Enter}{Enter}')
    expect(onSelect).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(trigger)
  })

  it('moves focus with arrows and Home/End, skips disabled actions, and restores its trigger on Escape', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DropdownMenu label="Event actions" items={[
      { id: 'share', label: 'Share event', onSelect },
      { id: 'edit', label: 'Edit event', disabled: true, onSelect },
      { id: 'save', label: 'Save event', onSelect },
    ]} />)
    const trigger = screen.getByRole('button', { name: 'Event actions' })
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menu').getAttribute('aria-labelledby')).toBe(trigger.id)
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Share event' }))
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save event' }))
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Share event' }))
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save event' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('supports typeahead and keyboard activation without submitting its surrounding form', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onSubmit = vi.fn(event => event.preventDefault())
    render(<form onSubmit={onSubmit}><DropdownMenu label="More" items={[
      { id: 'copy', label: 'Copy event link', onSelect: vi.fn() },
      { id: 'save', label: 'Save event', onSelect: onSave },
    ]} /></form>)
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.keyboard('s{Enter}')
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More' }))
  })

  it('lets Tab and outside clicks leave the menu without stealing focus', async () => {
    const user = userEvent.setup()
    render(<><DropdownMenu label="More" items={[{ id: 'save', label: 'Save', onSelect: vi.fn() }]} /><button>Continue</button></>)
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.tab()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continue' }))
  })
})

describe('Select', () => {
  const options = [
    { value: 'sf', label: 'San Francisco' },
    { value: 'la', label: 'Los Angeles', disabled: true },
    { value: 'ny', label: 'New York' },
    { value: 'london', label: 'London' },
  ]

  it('keeps keyboard focus on its labelled combobox and only commits navigation when confirmed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const view = render(<Select label="City" name="city" value="sf" onValueChange={onValueChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'City' })
    await user.click(trigger)
    await user.keyboard('{ArrowDown}')
    const activeId = trigger.getAttribute('aria-activedescendant')!
    expect(document.getElementById(activeId)?.textContent).toBe('New York')
    expect(document.activeElement).toBe(trigger)
    expect(screen.getByRole('option', { name: 'San Francisco' }).getAttribute('aria-selected')).toBe('true')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('ny')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger.textContent).toBe('San Francisco')
    view.rerender(<Select label="City" name="city" value="ny" onValueChange={onValueChange} options={options} />)
    expect(trigger.textContent).toBe('New York')
    expect(view.container.querySelector<HTMLInputElement>('input[name="city"]')?.value).toBe('ny')
  })

  it('supports closed and open typeahead, skips disabled matches, and cancels without changing the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Select aria-label="City" value="sf" onValueChange={onValueChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'City' })
    trigger.focus()
    await user.keyboard('l')
    expect(onValueChange).toHaveBeenLastCalledWith('london')
    onValueChange.mockClear()
    await user.click(trigger)
    await user.keyboard('{End}')
    expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)?.textContent).toBe('London')
    await user.keyboard('{Home}')
    expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)?.textContent).toBe('San Francisco')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger)
  })

  it('works inside a dialog without moving its popup outside it or propagating Escape', async () => {
    const user = userEvent.setup()
    const onDialogEscape = vi.fn()
    function Example() {
      const [value, setValue] = useState('sf')
      return <dialog open aria-label="Event settings" onKeyDown={event => { if (event.key === 'Escape') onDialogEscape() }}>
        <Select label="City" value={value} onValueChange={setValue} options={options} /><button>Done</button>
      </dialog>
    }
    render(<Example />)
    const trigger = screen.getByRole('combobox', { name: 'City' })
    await user.click(trigger)
    expect(screen.getByRole('dialog').contains(screen.getByRole('listbox'))).toBe(true)
    await user.click(screen.getByRole('option', { name: 'New York' }))
    expect(trigger.textContent).toBe('New York')
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(onDialogEscape).not.toHaveBeenCalled()
    await user.click(trigger)
    await user.tab()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Done' }))
  })

  it('renders on the server and preserves disabled controls and options', async () => {
    const markup = renderToString(<Select label="City" value="sf" onValueChange={() => {}} options={options} />)
    expect(markup).toContain('role="combobox"')
    const onValueChange = vi.fn()
    const view = render(<Select label="City" value="sf" onValueChange={onValueChange} options={options} disabled />)
    const trigger = screen.getByRole('combobox', { name: 'City' })
    expect(trigger.hasAttribute('disabled')).toBe(true)
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
    view.rerender(<Select label="City" value="sf" onValueChange={onValueChange} options={options} />)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Los Angeles' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
