import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useIsomorphicLayoutEffect } from '../shared/useIsomorphicLayoutEffect'

export function useDropdownPosition(
  open: boolean,
  root: RefObject<HTMLDivElement | null>,
  trigger: RefObject<HTMLButtonElement | null>,
  popup: RefObject<HTMLDivElement | null>,
  align: 'start' | 'end',
) {
  const [position, setPosition] = useState<CSSProperties>({})
  useIsomorphicLayoutEffect(() => {
    if (!open) return
    function update() {
      if (!root.current || !trigger.current || !popup.current) return
      const rootBox = root.current.getBoundingClientRect()
      const triggerBox = trigger.current.getBoundingClientRect()
      const viewportTop = window.visualViewport?.offsetTop ?? 0
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth
      const below = viewportTop + viewportHeight - triggerBox.bottom - 18
      const above = triggerBox.top - viewportTop - 18
      const aboveTrigger = below < Math.min(popup.current.scrollHeight, 240) && above > below
      const preferredLeft = align === 'end' ? rootBox.right - popup.current.offsetWidth : rootBox.left
      const offset = Math.max(12 - preferredLeft, Math.min(0, viewportWidth - 12 - preferredLeft - popup.current.offsetWidth))
      setPosition({
        top: aboveTrigger ? 'auto' : triggerBox.bottom - rootBox.top + 6,
        bottom: aboveTrigger ? rootBox.bottom - triggerBox.top + 6 : 'auto',
        maxHeight: Math.max(48, Math.min(320, aboveTrigger ? above : below)),
        transform: offset ? `translateX(${offset}px)` : undefined,
      })
    }
    update()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    if (trigger.current) observer?.observe(trigger.current)
    if (popup.current) observer?.observe(popup.current)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [open, root, trigger, popup, align])
  return position
}

export function useOutsideDismiss(open: boolean, root: RefObject<HTMLDivElement | null>, dismiss: () => void) {
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) dismiss()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, root, dismiss])
}

export function nextEnabled(items: readonly { disabled?: boolean }[], current: number, direction: 1 | -1) {
  for (let step = 1; step <= items.length; step++) {
    const next = (current + step * direction + items.length) % items.length
    if (!items[next].disabled) return next
  }
  return -1
}

export function revealActiveOption(popup: HTMLDivElement | null, index: number) {
  const option = popup?.querySelector<HTMLElement>(`[data-index="${index}"]`)
  if (!popup || !option) return
  const top = option.offsetTop
  const bottom = top + option.offsetHeight
  if (top < popup.scrollTop) popup.scrollTop = top
  else if (bottom > popup.scrollTop + popup.clientHeight) popup.scrollTop = bottom - popup.clientHeight
}

export function useTypeahead() {
  const search = useRef({ text: '', at: 0 })
  return (key: string, items: readonly { label: string; disabled?: boolean }[], current: number) => {
    const now = Date.now()
    search.current.text = now - search.current.at > 700 ? key : search.current.text + key
    search.current.at = now
    const query = search.current.text.toLocaleLowerCase()
    // Repeating a character cycles through matching options.
    const term = Array.from(query).every(character => character === query[0]) ? query[0] : query
    const start = term.length === 1 ? current + 1 : Math.max(0, current)
    for (let step = 0; step < items.length; step++) {
      const index = (start + step) % items.length
      if (!items[index].disabled && items[index].label.toLocaleLowerCase().startsWith(term)) return index
    }
    return current
  }
}
