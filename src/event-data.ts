import fixtures from './event-fixtures.json'
import directory from './directory-fixtures.json'
import capturedThemes from './ui/backgrounds/event-theme-fixtures.json'

export interface EventRecord {
  slug: string; name: string; image: string; start: string; end: string; timezone: string;
  host: string; hostAvatar: string; city: string; location: string; privateLocation: boolean;
  going: number; theme: string; tint: string; waitlist: boolean; soldOut: boolean; free: boolean;
  approval: boolean; price: { cents: number; currency: string } | null;
  categories: { name: string; slug: string; description?: string; hero_image_desktop_url?: string }[];
  description: string[];
  fontTitle?: string | null;
}
const themeSettings: Record<string, { fontTitle: string | null }> = capturedThemes
export const allEvents: EventRecord[] = fixtures.map(event => ({ ...event, fontTitle: themeSettings[event.slug]?.fontTitle ?? null }))
export const popularEvents = allEvents.slice(0, 6)
export const findEvent = (slug: string) => allEvents.find(event => event.slug === slug)
export const eventCity = (event: EventRecord) => event.slug === 'july4-brooklyn' ? 'New York' : event.slug === '5.5' ? 'Online' : 'Tokyo'
export function eventTags(event: EventRecord) {
  const tags = event.categories.map(category => category.name)
  if (event.slug === 'l2tdcs1e') tags.push('Games')
  if (event.slug === 'dhq3kyhy') tags.push('Arts & Culture')
  if (event.slug === '5.5') tags.push('AI', 'Tech')
  if (event.slug === 'z0zqovpu') tags.push('Tech')
  if (event.slug === 'july4-brooklyn') tags.push('Arts & Culture')
  return tags
}
export const formatDate = (event: EventRecord, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { ...options, timeZone: event.timezone }).format(new Date(event.start))
export const eventTime = (event: EventRecord) => formatDate(event, { hour: 'numeric', minute: '2-digit' })
export const eventDate = (event: EventRecord) => formatDate(event, { month: 'short', day: 'numeric' })
export function eventPrice(event: EventRecord) {
  if (!event.price || event.free) return 'Free'
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price.currency.toUpperCase() })
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(event.price.cents / (10 ** digits))
}

export const directoryCities = directory.cities
export const directoryCategories = directory.categories
export const cityGroups = directoryCities.reduce<Record<string, string[]>>((groups, city) => {
  (groups[city.continent] ||= []).push(city.name)
  return groups
}, {})
for (const group of Object.values(cityGroups)) group.sort((a, b) => a.localeCompare(b))
export const citySlug = (name: string) => directoryCities.find(city => city.name === name)?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')
export const cities = directoryCities.map(city => city.name)
export const cityFromSlug = (slug: string) => directoryCities.find(city => city.slug === slug)?.name
export const relativeEventDate = (event: EventRecord) => {
  const date = new Date(event.start).toLocaleDateString('en-US', { timeZone: event.timezone })
  const today = new Date().toLocaleDateString('en-US', { timeZone: event.timezone })
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { timeZone: event.timezone })
  return date === today ? 'Today' : date === tomorrow ? 'Tomorrow' : formatDate(event, { weekday: 'short', month: 'short', day: 'numeric' })
}
