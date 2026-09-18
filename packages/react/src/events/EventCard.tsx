'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Icon } from '../foundations'
import './event-card.css'

export interface EventCardBadge {
  label: ReactNode
  tone?: 'neutral' | 'warning'
}

export type EventCardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }

export interface EventCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'children' | 'href'> {
  title: string
  href: string
  coverUrl: string
  coverAlt?: string
  variant?: 'timeline' | 'compact'
  time?: ReactNode
  location?: ReactNode
  hostName?: string
  hostAvatarUrl?: string
  hostPrefix?: string
  badges?: readonly EventCardBadge[]
  going?: number
  goingLabel?: string
  /** Adapt the root link to your router or preview controller. Forward all props. */
  renderLink?: (props: EventCardLinkProps) => ReactNode
}

/** The discovery cards used by the clone, with data and navigation supplied by you. */
export function EventCard({
  title, href, coverUrl, coverAlt = '', variant = 'timeline', time, location,
  hostName, hostAvatarUrl, hostPrefix = 'By', badges = [], going, goingLabel,
  className = '', renderLink, ...anchorProps
}: EventCardProps) {
  const cover = <img className="eui-event-card__cover" src={coverUrl} alt={coverAlt} loading="lazy" />
  const children = <>
    {variant === 'compact' && cover}
    <div className="eui-event-card__info">
      {time != null && <span className="eui-event-card__time">{time}</span>}
      <h3 className="eui-event-card__title">{title}</h3>
      {variant === 'timeline' && hostName && <p className="eui-event-card__host">{hostAvatarUrl && <img src={hostAvatarUrl} alt="" />}{hostPrefix && `${hostPrefix} `}{hostName}</p>}
      {location != null && <p className="eui-event-card__location">{variant === 'timeline' && <Icon name="pin" size={14} />}{location}</p>}
      {variant === 'timeline' && (badges.length > 0 || (going != null && going > 0)) && <div className="eui-event-card__badges">
        {badges.map((badge, index) => <span className={`eui-event-card__badge${badge.tone === 'warning' ? ' eui-event-card__badge--warning' : ''}`} key={index}>{badge.label}</span>)}
        {going != null && going > 0 && <span className="eui-event-card__badge"><Icon name="users" size={13} />{goingLabel ?? `${going.toLocaleString()} Going`}</span>}
      </div>}
    </div>
    {variant === 'timeline' && cover}
  </>
  const linkProps: EventCardLinkProps = {
    ...anchorProps,
    href,
    className: `eui-event-card eui-event-card--${variant} ${className}`.trim(),
    children,
  }
  return renderLink ? renderLink(linkProps) : <a {...linkProps} />
}
