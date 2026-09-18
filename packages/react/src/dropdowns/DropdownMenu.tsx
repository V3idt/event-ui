'use client'

import { useCallback, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../foundations/Icon'
import { useIsomorphicLayoutEffect } from '../shared/useIsomorphicLayoutEffect'
import { nextEnabled, revealActiveOption, useDropdownPosition, useOutsideDismiss, useTypeahead } from './useDropdown'
import './dropdowns.css'

export interface DropdownMenuItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  onSelect: () => void
}

export interface DropdownMenuProps {
  label: ReactNode
  items: readonly DropdownMenuItem[]
  align?: 'start' | 'end'
  /** Hide the chevron for an icon-only trigger with an accessible label. */
  showChevron?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
  style?: CSSProperties
  'aria-label'?: string
}

export function DropdownMenu({ label, items, align = 'start', showChevron = true, disabled, className = '', triggerClassName = '', style, 'aria-label': ariaLabel }: DropdownMenuProps) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const typeahead = useTypeahead()
  const close = useCallback(() => setOpen(false), [])
  const position = useDropdownPosition(open, root, trigger, popup, align)
  useOutsideDismiss(open, root, close)

  useIsomorphicLayoutEffect(() => {
    if (!open) return
    const item = popup.current?.querySelector<HTMLButtonElement>(`[data-index="${active}"]`)
    ;(item ?? popup.current)?.focus({ preventScroll: true })
    revealActiveOption(popup.current, active)
  }, [open, active, position.maxHeight])

  useIsomorphicLayoutEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function openMenu(last = false) {
    setActive(nextEnabled(items, last ? 0 : -1, last ? -1 : 1))
    setOpen(true)
  }

  function closeToTrigger() {
    setOpen(false)
    trigger.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeToTrigger()
      return
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (event.key === 'Home') setActive(nextEnabled(items, -1, 1))
      else if (event.key === 'End') setActive(nextEnabled(items, 0, -1))
      else setActive(nextEnabled(items, active, event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      setActive(typeahead(event.key, items, active))
    }
  }

  return <div ref={root} className={`eui-dropdown ${className}`.trim()} style={style} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close()
  }}>
    <button ref={trigger} id={`${id}-trigger`} type="button" disabled={disabled}
      className={`eui-dropdown-trigger ${triggerClassName}`.trim()} aria-label={ariaLabel}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined}
      onClick={() => open ? close() : openMenu()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          openMenu(event.key === 'ArrowUp')
        }
      }}>
      {label}{showChevron && <Icon name="chevronDown" size={16} className="eui-dropdown-chevron" />}
    </button>
    {open && <div ref={popup} id={`${id}-menu`} role="menu" aria-labelledby={`${id}-trigger`} tabIndex={-1}
      className="eui-dropdown-popup eui-dropdown-menu" data-align={align} style={position} onKeyDown={onKeyDown}>
      {items.map((item, index) => <button key={item.id} role="menuitem" type="button" tabIndex={-1}
        className="eui-dropdown-item" disabled={item.disabled} data-danger={item.danger || undefined}
        data-active={active === index || undefined} data-index={index}
        onPointerMove={() => { if (!item.disabled) setActive(index) }}
        onFocus={() => setActive(index)}
        onClick={() => { closeToTrigger(); item.onSelect() }}>
        {item.icon && <span className="eui-dropdown-item-icon" aria-hidden="true">{item.icon}</span>}
        <span>{item.label}</span>
      </button>)}
    </div>}
  </div>
}
