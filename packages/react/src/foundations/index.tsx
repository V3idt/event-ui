'use client'

import { createContext, useContext, useId, useState, type ComponentPropsWithRef, type ReactNode, type KeyboardEvent } from 'react'
import './foundations.css'
export { Icon, type IconName, type IconProps } from './Icon'

const fontClass = (name: string, extra?: string) => `eui-${name}${extra ? ` ${extra}` : ''}`
const describedBy = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ') || undefined

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md'
  loading?: boolean
  loadingLabel?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', loading = false, loadingLabel, disabled, type = 'button', className, children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} data-variant={variant} data-size={size} className={fontClass('button', className)}>
    {loading && <span className="eui-spinner" aria-hidden="true" />}
    {loading && loadingLabel != null ? loadingLabel : children}
  </button>
}

export interface IconButtonProps extends ButtonProps { 'aria-label': string }
export function IconButton({ variant = 'ghost', className, children, ...props }: IconButtonProps) {
  return <Button {...props} variant={variant} className={fontClass('icon-button', className)}>{props.loading ? null : children}</Button>
}

export interface BadgeProps extends ComponentPropsWithRef<'span'> { variant?: 'neutral' | 'success' | 'warning' }
export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return <span {...props} data-variant={variant} className={fontClass('badge', className)} />
}

export interface CardProps extends ComponentPropsWithRef<'div'> { padding?: 'none' | 'sm' | 'md' }
export function Card({ padding = 'md', className, ...props }: CardProps) {
  return <div {...props} data-padding={padding} className={fontClass('card', className)} />
}
export function CardHeader({ className, ...props }: ComponentPropsWithRef<'div'>) { return <div {...props} className={fontClass('card-header', className)} /> }
export function CardTitle({ className, ...props }: ComponentPropsWithRef<'h3'>) { return <h3 {...props} className={fontClass('card-title', className)} /> }
export function CardDescription({ className, ...props }: ComponentPropsWithRef<'p'>) { return <p {...props} className={fontClass('card-description', className)} /> }
export function CardContent({ className, ...props }: ComponentPropsWithRef<'div'>) { return <div {...props} className={fontClass('card-content', className)} /> }
export function CardFooter({ className, ...props }: ComponentPropsWithRef<'div'>) { return <div {...props} className={fontClass('card-footer', className)} /> }

type AvatarSize = 'sm' | 'md' | 'lg'
const AvatarSizeContext = createContext<AvatarSize>('md')
export interface AvatarProps extends ComponentPropsWithRef<'span'> {
  src?: string
  alt: string
  fallback?: ReactNode
  size?: AvatarSize
  shape?: 'circle' | 'rounded'
  imageProps?: Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt'>
}
export function Avatar({ src, alt, fallback, size, shape = 'circle', imageProps, className, ...props }: AvatarProps) {
  const groupSize = useContext(AvatarSizeContext)
  const [failedSource, setFailedSource] = useState<string>()
  const initials = alt.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()
  return <span role="img" aria-label={alt} {...props} data-size={size ?? groupSize} data-shape={shape} className={fontClass('avatar', className)}>
    {src && failedSource !== src ? <img {...imageProps} src={src} alt="" onError={event => { setFailedSource(src); imageProps?.onError?.(event) }} /> : fallback ?? initials}
  </span>
}
export interface AvatarGroupProps extends ComponentPropsWithRef<'div'> { size?: AvatarSize }
export function AvatarGroup({ size = 'md', className, children, ...props }: AvatarGroupProps) {
  return <AvatarSizeContext.Provider value={size}><div {...props} className={fontClass('avatar-group', className)}>{children}</div></AvatarSizeContext.Provider>
}

interface FieldContextValue { id: string; descriptionId?: string; invalid?: boolean; required?: boolean }
const FieldContext = createContext<FieldContextValue | null>(null)
export interface FieldProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  required?: boolean
  htmlFor?: string
  children: ReactNode
}
export function Field({ label, description, error, required, htmlFor, children, className, ...props }: FieldProps) {
  const generatedId = useId()
  const controlId = htmlFor ?? `eui-field-${generatedId}`
  const hasError = error != null && error !== false && error !== ''
  const hasDescription = description != null && description !== false && description !== ''
  const descriptionId = describedBy(hasDescription ? `${controlId}-description` : undefined, hasError ? `${controlId}-error` : undefined)
  return <FieldContext.Provider value={{ id: controlId, descriptionId, invalid: hasError, required }}>
    <div {...props} className={fontClass('field', className)}>
      <label className="eui-field-label" htmlFor={controlId}>{label}{required && <span aria-hidden="true" className="eui-field-required"> *</span>}</label>
      {children}
      {hasDescription && <div id={`${controlId}-description`} className="eui-field-description">{description}</div>}
      {hasError && <div id={`${controlId}-error`} className="eui-field-error" role="alert">{error}</div>}
    </div>
  </FieldContext.Provider>
}

export interface InputProps extends ComponentPropsWithRef<'input'> { invalid?: boolean }
export function Input({ invalid, className, ...props }: InputProps) {
  const field = useContext(FieldContext)
  return <input {...props} id={props.id ?? field?.id} required={props.required ?? field?.required} aria-invalid={props['aria-invalid'] ?? (invalid || field?.invalid || undefined)} aria-describedby={describedBy(props['aria-describedby'], field?.descriptionId)} className={fontClass('input', className)} />
}
export interface TextareaProps extends ComponentPropsWithRef<'textarea'> { invalid?: boolean }
export function Textarea({ invalid, className, ...props }: TextareaProps) {
  const field = useContext(FieldContext)
  return <textarea rows={4} {...props} id={props.id ?? field?.id} required={props.required ?? field?.required} aria-invalid={props['aria-invalid'] ?? (invalid || field?.invalid || undefined)} aria-describedby={describedBy(props['aria-describedby'], field?.descriptionId)} className={fontClass('textarea', className)} />
}

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children'> {
  label?: ReactNode
  description?: ReactNode
}
export type SwitchProps = CheckboxProps
function CheckControl({ label, description, className, switchControl, ...props }: CheckboxProps & { switchControl?: boolean }) {
  const field = useContext(FieldContext)
  const generatedId = useId()
  const id = props.id ?? field?.id ?? `eui-check-${generatedId}`
  const hasDescription = description != null && description !== false && description !== ''
  return <label className={fontClass(switchControl ? 'switch' : 'checkbox', className)} data-disabled={props.disabled || undefined}>
    <input {...props} id={id} type="checkbox" role={switchControl ? 'switch' : props.role} required={props.required ?? field?.required} aria-labelledby={props['aria-labelledby'] ?? (label != null && props['aria-label'] == null ? `${id}-label` : undefined)} aria-invalid={props['aria-invalid'] ?? (field?.invalid || undefined)} aria-describedby={describedBy(props['aria-describedby'], field?.descriptionId, hasDescription ? `${id}-hint` : undefined)} />
    {switchControl && <span className="eui-switch-track" aria-hidden="true" />}
    {(label != null || hasDescription) && <span className="eui-check-copy">{label != null && <span id={`${id}-label`} className="eui-check-label">{label}</span>}{hasDescription && <span id={`${id}-hint`} className="eui-field-description">{description}</span>}</span>}
  </label>
}
export function Checkbox(props: CheckboxProps) { return <CheckControl {...props} /> }
export function Switch(props: SwitchProps) { return <CheckControl {...props} switchControl /> }

export interface SeparatorProps extends ComponentPropsWithRef<'div'> { orientation?: 'horizontal' | 'vertical'; decorative?: boolean }
export function Separator({ orientation = 'horizontal', decorative = true, className, ...props }: SeparatorProps) {
  return <div {...props} role={decorative ? 'none' : 'separator'} aria-orientation={decorative ? undefined : orientation} data-orientation={orientation} className={fontClass('separator', className)} />
}

export interface TabItem { value: string; label: ReactNode; content?: ReactNode; disabled?: boolean }
export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange'> {
  value: string
  onValueChange: (value: string) => void
  items: TabItem[]
  orientation?: 'horizontal' | 'vertical'
  'aria-label': string
}
export function Tabs({ value, onValueChange, items, orientation = 'horizontal', className, 'aria-label': label, ...props }: TabsProps) {
  const id = useId()
  const selectedIndex = items.findIndex(item => item.value === value && !item.disabled)
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : items.findIndex(item => !item.disabled)
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys = orientation === 'horizontal' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']
    if (![...keys, 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const enabled = items.map((item, i) => !item.disabled ? i : -1).filter(i => i >= 0)
    if (!enabled.length) return
    const backwards = event.key === keys[0]
    const isRtl = orientation === 'horizontal' && getComputedStyle(event.currentTarget).direction === 'rtl'
    const step = backwards !== isRtl ? -1 : 1
    const next = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1)! : enabled[(enabled.indexOf(index) + step + enabled.length) % enabled.length]
    const tab = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-eui-tab-index="${next}"]`)
    tab?.focus()
    onValueChange(items[next].value)
  }
  return <div {...props} data-orientation={orientation} className={fontClass('tabs', className)}>
    <div role="tablist" aria-label={label} aria-orientation={orientation} className="eui-tab-list">
      {items.map((item, index) => <button key={item.value} id={`${id}-tab-${index}`} type="button" role="tab" data-eui-tab-index={index} aria-selected={value === item.value} aria-controls={item.content !== undefined ? `${id}-panel-${index}` : undefined} disabled={item.disabled} tabIndex={index === tabStopIndex ? 0 : -1} className="eui-tab" onClick={() => onValueChange(item.value)} onKeyDown={event => handleKey(event, index)}>{item.label}</button>)}
    </div>
    {items.map((item, index) => item.content !== undefined && <div key={item.value} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={value !== item.value} tabIndex={0} className="eui-tab-panel">{item.content}</div>)}
  </div>
}
