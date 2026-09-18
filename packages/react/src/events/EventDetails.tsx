'use client'

import { useId, type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from 'react'
import { Icon } from '../foundations'
import './event-details.css'

export interface RegistrationCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  description?: ReactNode
  status?: { title: string; description?: ReactNode; icon?: ReactNode }
  price?: { label: ReactNode; amount: ReactNode }
  action: ReactNode
}

/** Registration presentation only. Supply your own button, form, and submission behavior. */
export function RegistrationCard({ title = 'Registration', description, status, price, action, className = '', ...props }: RegistrationCardProps) {
  const titleId = useId()
  return <section {...props} className={`eui-registration ${className}`.trim()} aria-labelledby={props['aria-labelledby'] ?? titleId}>
    <div className="eui-registration__heading" id={titleId}>{title}</div>
    {status && <div className="eui-registration__status"><span className="eui-registration__status-icon">{status.icon ?? <Icon name="ticket" size={18} />}</span><div><strong>{status.title}</strong>{status.description && <p>{status.description}</p>}</div></div>}
    <div className="eui-registration__body">
      {description && <div className="eui-registration__description">{description}</div>}
      {price && <div className="eui-registration__price"><strong>{price.label}</strong><span>{price.amount}</span></div>}
      <div className="eui-registration__action">{action}</div>
    </div>
  </section>
}

export interface EventDetailsHost {
  name: string
  avatarUrl?: string
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export interface EventDetailsDate {
  month: string
  day: string | number
  label: ReactNode
  time: ReactNode
  href?: string
  download?: string
}

export interface EventDetailsLocation {
  name: ReactNode
  detail?: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
  icon?: ReactNode
}

export interface EventDetailsProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'about'> {
  title: string
  coverUrl: string
  coverAlt?: string
  presentation?: 'page' | 'preview'
  titleStyle?: CSSProperties
  host?: EventDetailsHost
  date: EventDetailsDate
  location?: EventDetailsLocation
  registration?: RegistrationCardProps
  about?: ReactNode
  featured?: ReactNode
  actions?: ReactNode
  sidebar?: ReactNode
  locationDetails?: ReactNode
  onCoverClick?: MouseEventHandler<HTMLButtonElement>
  labels?: Partial<{ hostedBy: string; about: string; location: string; viewCover: string; addToCalendar: string }>
}

/** The clone's event layout, shared by full pages and the preview side panel. */
export function EventDetails({
  title, coverUrl, coverAlt = '', presentation = 'page', titleStyle,
  host, date, location, registration, about, featured, actions, sidebar,
  locationDetails, onCoverClick, labels, className = '', ...props
}: EventDetailsProps) {
  const preview = presentation === 'preview'
  const titleSize = title.length > 96 ? 'xxl' : title.length > 64 ? 'xl' : title.length > 36 ? 'long' : 'normal'
  const text = { hostedBy: 'Hosted By', about: 'About Event', location: 'Location', viewCover: 'View event cover', addToCalendar: 'Add event to calendar', ...labels }
  const hostContent = (inline = false) => host && <>{host.avatarUrl && <img src={host.avatarUrl} alt="" />}{inline && `${text.hostedBy} `}{host.name}</>
  const hostLine = (inline = false) => host && (host.onClick
    ? <button type="button" className={inline ? 'eui-event-details__host-line' : 'eui-event-details__host'} onClick={host.onClick}>{hostContent(inline)}</button>
    : host.href
      ? <a className={inline ? 'eui-event-details__host-line' : 'eui-event-details__host'} href={host.href}>{hostContent(inline)}</a>
      : <div className={inline ? 'eui-event-details__host-line' : 'eui-event-details__host'}>{hostContent(inline)}</div>)
  const cover = <><img className="eui-event-details__cover-image" src={coverUrl} alt={coverAlt} />{preview && <img className="eui-event-details__cover-glow" src={coverUrl} alt="" aria-hidden="true" />}</>
  const dateContent = <><span className="eui-event-details__date-icon"><small>{date.month}</small><span>{date.day}</span></span><span><strong>{date.label}</strong><small>{date.time}</small></span></>
  const locationContent = location && <><span className="eui-event-details__fact-icon">{location.icon ?? <Icon name="pin" size={23} />}</span><span><strong>{location.name}</strong>{location.detail && <small>{location.detail}</small>}</span></>
  return <section {...props} className={`eui-event-details eui-event-details--${presentation} ${className}`.trim()}>
    <aside className="eui-event-details__sidebar">
      {onCoverClick ? <button type="button" className="eui-event-details__cover" onClick={onCoverClick} aria-label={text.viewCover}>{cover}</button> : <div className="eui-event-details__cover">{cover}</div>}
      {(host || sidebar) && <div className="eui-event-details__hosts">{host && <><div className="eui-event-details__section-label">{text.hostedBy}</div>{hostLine()}</>}{sidebar}</div>}
    </aside>
    <article className="eui-event-details__content">
      {!preview && featured && <div className="eui-event-details__featured">{featured}</div>}
      <h1 className={`eui-event-details__title eui-event-details__title--${titleSize}`} style={titleStyle}>{title}</h1>
      {preview && hostLine(true)}
      <div className="eui-event-details__facts">
        {date.href ? <a className="eui-event-details__fact" href={date.href} download={date.download} aria-label={text.addToCalendar}>{dateContent}</a> : <div className="eui-event-details__fact">{dateContent}</div>}
        {location && (location.href ? <a className="eui-event-details__fact" href={location.href} onClick={location.onClick}>{locationContent}</a> : location.onClick ? <button type="button" className="eui-event-details__fact" onClick={location.onClick}>{locationContent}</button> : <div className="eui-event-details__fact">{locationContent}</div>)}
      </div>
      {registration && <RegistrationCard {...registration} />}
      {actions && <div className="eui-event-details__actions">{actions}</div>}
      {about && <section className="eui-event-details__about"><h2 className="eui-event-details__section-label">{text.about}</h2>{about}</section>}
      {locationDetails && <section className="eui-event-details__location"><h2 className="eui-event-details__section-label">{text.location}</h2>{locationDetails}</section>}
    </article>
  </section>
}
