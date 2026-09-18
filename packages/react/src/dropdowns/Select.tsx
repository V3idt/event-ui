'use client'

import { useCallback, useId, useRef, useState, type AriaAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useIsomorphicLayoutEffect } from '../shared/useIsomorphicLayoutEffect'
import { Icon } from '../foundations/Icon'
import { nextEnabled, revealActiveOption, useDropdownPosition, useOutsideDismiss, useTypeahead } from './useDropdown'
import './dropdowns.css'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  label?: ReactNode
  value: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

export function Select({ label, value, onValueChange, options, placeholder = 'Select an option', disabled, name, id: suppliedId, className = '', style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid }: SelectProps) {
  const generatedId = useId()
  const id = suppliedId ?? generatedId
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const selected = options.findIndex(option => option.value === value)
  const typeahead = useTypeahead()
  const close = useCallback(() => setOpen(false), [])
  const position = useDropdownPosition(open, root, trigger, popup, 'start')
  useOutsideDismiss(open, root, close)

  useIsomorphicLayoutEffect(() => {
    if (open) revealActiveOption(popup.current, active)
  }, [open, active, position.maxHeight])

  useIsomorphicLayoutEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function openList(last = false) {
    setActive(selected >= 0 && !options[selected].disabled ? selected : nextEnabled(options, last ? 0 : -1, last ? -1 : 1))
    setOpen(true)
  }

  function choose(index: number) {
    if (!options[index] || options[index].disabled) return
    if (options[index].value !== value) onValueChange(options[index].value)
    setOpen(false)
    trigger.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (!open) {
        openList(event.key === 'ArrowUp' || event.key === 'End')
        if (event.key === 'Home') setActive(nextEnabled(options, -1, 1))
        if (event.key === 'End') setActive(nextEnabled(options, 0, -1))
      }
      else if (event.key === 'Home') setActive(nextEnabled(options, -1, 1))
      else if (event.key === 'End') setActive(nextEnabled(options, 0, -1))
      else setActive(nextEnabled(options, active, event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(active)
      else openList()
    } else if (event.key === 'Tab') {
      close()
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      const index = typeahead(event.key, options, open ? active : selected)
      if (open) setActive(index)
      else if (index >= 0 && index !== selected && !options[index].disabled) onValueChange(options[index].value)
    }
  }

  return <div ref={root} className={`eui-dropdown eui-select ${className}`.trim()} style={style} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close()
  }}>
    {label != null && <label className="eui-select-label" id={`${id}-label`} htmlFor={id}>{label}</label>}
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    <button ref={trigger} id={id} role="combobox" type="button" className="eui-dropdown-trigger eui-select-trigger"
      disabled={disabled} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (label != null ? `${id}-label` : undefined)}
      aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? `${id}-listbox` : undefined}
      aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
      onClick={() => open ? close() : openList()} onKeyDown={onKeyDown}>
      <span className="eui-select-value" data-placeholder={selected < 0 || undefined}>{selected >= 0 ? options[selected].label : placeholder}</span>
      <Icon name="chevronDown" size={16} className="eui-dropdown-chevron" />
    </button>
    {open && <div ref={popup} id={`${id}-listbox`} role="listbox" aria-labelledby={label != null ? `${id}-label` : id}
      className="eui-dropdown-popup eui-select-options" style={position}>
      {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option"
        aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
        className="eui-dropdown-item eui-select-option" data-index={index} data-active={active === index || undefined}
        onPointerMove={() => { if (!option.disabled) setActive(index) }}
        onMouseDown={event => event.preventDefault()}
        onClick={() => choose(index)}>
        <span className="eui-select-option-copy"><span>{option.label}</span>{option.description && <span className="eui-select-description">{option.description}</span>}</span>
        {option.value === value && <Icon name="check" size={16} className="eui-select-check" />}
      </div>)}
    </div>}
  </div>
}
