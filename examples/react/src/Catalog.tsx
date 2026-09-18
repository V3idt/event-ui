import { useEffect, useState, type ReactNode } from 'react'
import {
  Avatar, AvatarGroup, Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Checkbox, DropdownMenu, EventBackground, EventCard, EventDetails, EventPreview, Field, Icon, IconButton,
  Input, RegistrationCard, Select, Separator, SidePanel, Switch, Tabs, Textarea,
  type EventBackgroundTheme, type IconName,
} from '@event-ui/react'
import { events, formatDate, themeOptions } from './data'
import wordmark from './assets/wordmark.svg'
import './catalog.css'

const components = [
  { id: 'buttons', name: 'Button', group: 'Foundations', description: 'Primary actions, secondary actions, and compact icon buttons.', source: 'Event registration & page controls' },
  { id: 'cards', name: 'Card', group: 'Foundations', description: 'A quiet surface for related content, with composable header, body, and footer.', source: 'Calendar cards & event registration' },
  { id: 'inputs', name: 'Input & Textarea', group: 'Foundations', description: 'Form fields with labels, descriptions, validation, and disabled states.', source: 'Search & registration forms' },
  { id: 'select', name: 'Select', group: 'Foundations', description: 'Choose one option with a styled dropdown and keyboard navigation.', source: 'Discovery filter styling' },
  { id: 'dropdown', name: 'Dropdown menu', group: 'Foundations', description: 'Contextual actions with icons, disabled items, and keyboard support.', source: 'Shared surface & control styling' },
  { id: 'toggles', name: 'Checkbox & Switch', group: 'Foundations', description: 'Native form controls with controlled state and accessible labels.', source: 'Shared control styling' },
  { id: 'tabs', name: 'Tabs', group: 'Foundations', description: 'Switch between related views. Use arrow keys to move between tabs.', source: 'Discovery category tabs' },
  { id: 'badges', name: 'Badge', group: 'Foundations', description: 'Small status labels for availability, attendance, and categories.', source: 'Event status badges' },
  { id: 'avatars', name: 'Avatar', group: 'Foundations', description: 'Host images, attendee groups, and initials when an image is unavailable.', source: 'Hosts & guest previews' },
  { id: 'icons', name: 'Icon', group: 'Foundations', description: 'The same stroke icons used in the clone, with configurable size.', source: 'PageUI icon set' },
  { id: 'separator', name: 'Separator', group: 'Foundations', description: 'A subtle divider between sections of content.', source: 'Event detail section borders' },
  { id: 'event-card', name: 'Event card', group: 'Event components', description: 'The timeline and compact discovery cards extracted from the clone.', source: 'Tokyo timeline & event discovery' },
  { id: 'registration', name: 'Registration card', group: 'Event components', description: 'Registration, waitlist, and ticket information with your own action.', source: 'Event detail registration' },
  { id: 'event-preview', name: 'Event preview', group: 'Event components', description: 'The intermediate event panel, with its toolbar and full event content.', source: 'Event card → preview interaction' },
  { id: 'backgrounds', name: 'Event backgrounds', group: 'Event components', description: 'The actual animated theme renderers from the event pages.', source: 'Warp, Life, Grain & Standard themes' },
  { id: 'side-panel', name: 'Side panel', group: 'Event components', description: 'A desktop drawer that becomes a bottom sheet on mobile.', source: 'Event preview panel' },
] as const

const buttonVariants = ['primary', 'secondary', 'ghost', 'destructive'] as const
const iconNames: IconName[] = ['search','arrow','pin','calendar','share','heart','check','close','clock','ticket','globe','chevron','download','users','more','filter','chevronDown','copy','code','grid','plus','minus','mail']
const allPages = new Set(['overview', 'installation', ...components.map(component => component.id)])
function currentPage() { const hash = window.location.hash.slice(1); return allPages.has(hash) ? hash : 'overview' }

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  return <div className="catalog-code"><Button size="sm" variant="ghost" onClick={async () => {
    try { await navigator.clipboard.writeText(children); setCopied(true); setFailed(false) }
    catch { setFailed(true) }
  }}><Icon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Copied' : failed ? 'Select code to copy' : 'Copy'}</Button><pre><code>{children}</code></pre></div>
}

function Example({ children, code, title = 'Example', className = '' }: { children: ReactNode; code: string; title?: string; className?: string }) {
  const [tab, setTab] = useState('preview')
  return <section className={`catalog-example ${className}`} aria-label={title}>
    <Tabs aria-label={`${title} view`} value={tab} onValueChange={setTab} items={[
      { value: 'preview', label: 'Preview', content: <div className="catalog-example-content">{children}</div> },
      { value: 'code', label: 'Code', content: <Code>{code}</Code> },
    ]} />
  </section>
}

export default function Catalog({ cloneHref = 'http://localhost:5173/discover' }: { cloneHref?: string }) {
  const [page, setPage] = useState(currentPage)
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [theme, setTheme] = useState<EventBackgroundTheme>('warp')
  const [tint, setTint] = useState('#120404')
  const [paused, setPaused] = useState(false)
  const [preview, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [panel, setPanelKind] = useState<'settings' | 'registration'>('settings')
  const [panelOpen, setPanelOpen] = useState(false)
  const [cardVariant, setCardVariant] = useState('timeline')
  const [buttonVariant, setButtonVariant] = useState<typeof buttonVariants[number]>('primary')
  const [location, setLocation] = useState('tokyo')
  const [subscribed, setSubscribed] = useState(false)
  const [checked, setChecked] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [eventTab, setEventTab] = useState('upcoming')
  const [action, setAction] = useState('')
  const [saved, setSaved] = useState(false)
  const selected = components.find(component => component.id === page)
  const previewEvent = events[preview ?? 0]
  const visibleComponents = components.filter(component => `${component.name} ${component.group}`.toLowerCase().includes(search.toLowerCase()))
  const fullEventSlug = new URLSearchParams(window.location.search).get('event')
  const fullEvent = events.find(event => event.slug === fullEventSlug)

  useEffect(() => {
    const update = () => { setPage(currentPage()); setMobileNav(false); setSearch(''); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  // Preserve the selected content throughout the closing transition.
  function setPreview(index: number | null) {
    if (index !== null) setPreviewIndex(index)
    setPreviewOpen(index !== null)
  }
  function setPanel(kind: 'settings' | 'registration' | null) {
    if (kind !== null) setPanelKind(kind)
    setPanelOpen(kind !== null)
  }
  useEffect(() => {
    if (!mobileNav) return
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMobileNav(false)
      document.getElementById('catalog-navigation-toggle')?.focus()
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [mobileNav])

  function setBackground(value: string) {
    setTheme(value as EventBackgroundTheme)
    setTint(events.find(event => event.theme === value)?.tint ?? '#151515')
  }

  function eventCard(index: number, variant: 'timeline' | 'compact' = 'timeline') {
    const event = events[index]
    return <EventCard title={event.name} href={`?event=${event.slug}`} coverUrl={event.image}
      time={formatDate(event, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
      hostName={event.host || 'Community event'} hostAvatarUrl={event.hostAvatar} location={event.location}
      going={event.going} badges={event.waitlist ? [{ label: 'Waitlist', tone: 'warning' }] : []} variant={variant}
      onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); setPreview(index) } }} />
  }

  function eventDetails(event: typeof events[number], presentation: 'page' | 'preview') {
    return <EventDetails title={event.name} coverUrl={event.image} presentation={presentation}
      titleStyle={{ fontFamily: event.theme === 'warp' ? "'Roc Grotesk', Inter, sans-serif" : event.theme === 'life' ? "'Geist Mono', monospace" : 'Inter, sans-serif' }}
      host={{ name: event.host || 'Community event', avatarUrl: event.hostAvatar }}
      date={{ month: formatDate(event, { month: 'short' }), day: formatDate(event, { day: 'numeric' }), label: formatDate(event, { weekday: 'long', month: 'long', day: 'numeric' }), time: formatDate(event, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) }}
      location={{ name: event.location, detail: event.slug === 'july4-brooklyn' ? 'New York' : 'Tokyo, Japan' }}
      registration={{ description: event.waitlist ? 'This event is accepting waitlist registrations.' : 'Welcome! To join the event, please register below.', action: <Button variant="primary" onClick={() => setPanel('registration')}>{event.waitlist ? 'Join Waitlist' : 'Register'}</Button> }}
      about={<>{event.description.slice(0, 4).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</>}
      actions={<div className="catalog-row"><AvatarGroup>{events.filter(item => item.hostAvatar).map(item => <Avatar key={item.slug} src={item.hostAvatar} alt={item.host} size="sm" />)}</AvatarGroup><span>{event.going} Going</span></div>} />
  }

  const menuItems = [
    { id: 'preview', label: 'Preview event', icon: <Icon name="grid" size={16} />, onSelect: () => setPreview(0) },
    { id: 'save', label: saved ? 'Unsave event' : 'Save event', icon: <Icon name="heart" size={16} />, onSelect: () => { setSaved(value => !value); setAction(saved ? 'Event removed from saved events.' : 'Event saved.') } },
    { id: 'duplicate', label: 'Duplicate event', icon: <Icon name="copy" size={16} />, disabled: true, onSelect: () => {} },
  ]

  const cardCode = `<EventCard\n  title="${events[0].name}"\n  href="/events/tokyo-mixer"\n  coverUrl="/images/event.jpg"\n  hostName="Shun Harashima"\n  location="Makuhari New City"\n  variant="${cardVariant}"\n/>`
  const backgroundCode = `<EventBackground\n  theme="${theme}"\n  tint="${tint}"\n  mode="contained"\n  paused={${paused}}\n/>`

  function registration() {
    return <RegistrationCard description="Welcome! To join the event, please register below." action={<Button variant="primary" onClick={() => setPanel('registration')}>Register</Button>} />
  }

  function renderComponent() {
    switch (page) {
      case 'buttons': return <>
        <Example code={`<Button variant="${buttonVariant}">Register</Button>`}><div className="catalog-demo-stack"><div className="catalog-row">{buttonVariants.map(variant => <Button key={variant} variant={variant} onClick={() => setAction(`${variant[0].toUpperCase() + variant.slice(1)} button clicked.`)}>{variant === 'primary' ? 'Register' : variant === 'secondary' ? 'Subscribe' : variant === 'ghost' ? 'View event' : 'Cancel event'}</Button>)}</div><div className="catalog-row"><Button size="sm" onClick={() => setPanel('settings')}><Icon name="plus" size={15} />Create event</Button><IconButton aria-label="Save sample event" aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name={saved ? 'check' : 'heart'} /></IconButton><Button disabled>Disabled</Button><Button loading>Saving</Button></div></div></Example>
        <div className="catalog-config"><Select label="Button variant" value={buttonVariant} onValueChange={value => setButtonVariant(value as typeof buttonVariant)} options={buttonVariants.map(value => ({ value, label: value }))} /><Button variant={buttonVariant} onClick={() => setAction('Configured button clicked.')}>Try this variant</Button></div>
      </>
      case 'cards': return <Example code={'<Card>\n  <CardHeader>\n    <CardTitle>Tokyo community</CardTitle>\n    <CardDescription>Events worth showing up for.</CardDescription>\n  </CardHeader>\n  <CardFooter><Button>Subscribe</Button></CardFooter>\n</Card>'}><div className="catalog-two-col"><Card><CardHeader><Avatar src={events[0].hostAvatar} alt={events[0].host} shape="rounded" size="lg" /><CardTitle>Tokyo community</CardTitle><CardDescription>Meet people building, creating, and sharing ideas in Tokyo.</CardDescription></CardHeader><CardFooter><Button size="sm" aria-pressed={subscribed} onClick={() => setSubscribed(!subscribed)}>{subscribed ? 'Subscribed' : 'Subscribe'}{subscribed && <Icon name="check" size={14} />}</Button></CardFooter></Card>{registration()}</div></Example>
      case 'inputs': return <Example code={'<Field label="Email" description="Your registration confirmation goes here.">\n  <Input type="email" placeholder="you@example.com" required />\n</Field>\n<Field label="Message"><Textarea rows={3} /></Field>'}><form className="catalog-form" onSubmit={event => { event.preventDefault(); setAction('Form validated. This demo does not send registration data.') }}><Field label="Name" required><Input placeholder="Your name" autoComplete="name" required /></Field><Field label="Email" description="Your registration confirmation goes here." required><Input type="email" placeholder="you@example.com" autoComplete="email" required /></Field><Field label="Message"><Textarea placeholder="Anything the host should know?" rows={3} /></Field><Field label="Invalid field" error="Please enter a valid email address."><Input defaultValue="not-an-email" invalid /></Field><Field label="Disabled field"><Input value="Registration closed" disabled readOnly /></Field><Button type="submit" variant="primary">Check form</Button></form></Example>
      case 'select': return <Example code={'<Select\n  label="Location"\n  value={location}\n  onValueChange={setLocation}\n  options={[\n    { value: "tokyo", label: "Tokyo" },\n    { value: "new-york", label: "New York" },\n    { value: "online", label: "Online" },\n  ]}\n/>'}><div className="catalog-form"><Select label="Location" value={location} onValueChange={setLocation} options={[{ value: 'tokyo', label: 'Tokyo' },{ value: 'new-york', label: 'New York' },{ value: 'online', label: 'Online' },{ value: 'london', label: 'London', disabled: true }]} /><Select label="Unavailable" value="closed" onValueChange={() => {}} disabled options={[{ value: 'closed', label: 'Registration closed' }]} /><p className="catalog-hint">Arrow keys to navigate. Enter to select. Escape to close.</p></div></Example>
      case 'dropdown': return <Example code={'<DropdownMenu\n  label="Event options"\n  items={[\n    { id: "preview", label: "Preview event", onSelect: openPreview },\n    { id: "save", label: "Save event", onSelect: saveEvent },\n  ]}\n/>'}><div className="catalog-demo-stack"><div className="catalog-row"><DropdownMenu label="Event options" items={menuItems} /><DropdownMenu showChevron={false} aria-label="More event actions" label={<Icon name="more" />} items={menuItems} align="end" /></div><p className="catalog-hint">Open a preview, save an event, or navigate the menu with your keyboard.</p></div></Example>
      case 'toggles': return <Example code={'<Checkbox\n  label="Send me event updates"\n  checked={checked}\n  onChange={e => setChecked(e.target.checked)}\n/>\n<Switch label="Notifications" checked={enabled} onChange={onChange} />'}><div className="catalog-form"><Checkbox label="Send me event updates" description="News and reminders from the host." checked={checked} onChange={event => setChecked(event.target.checked)} /><Checkbox label="Registration closed" disabled /><Separator /><Switch label="Notifications" description="Receive a reminder before the event starts." checked={notifications} onChange={event => setNotifications(event.target.checked)} /><Switch label="Unavailable setting" disabled /></div></Example>
      case 'tabs': return <Example code={'<Tabs\n  aria-label="Events"\n  value={tab}\n  onValueChange={setTab}\n  items={[\n    { value: "upcoming", label: "Upcoming", content: <UpcomingEvents /> },\n    { value: "past", label: "Past", content: <PastEvents /> },\n  ]}\n/>'}><div className="catalog-wide"><Tabs aria-label="Event list" value={eventTab} onValueChange={setEventTab} items={[{ value: 'upcoming', label: 'Upcoming', content: <div className="catalog-tab-example">{eventCard(0, 'compact')}</div> },{ value: 'past', label: 'Past', content: <div className="catalog-tab-example">{eventCard(3, 'compact')}</div> },{ value: 'drafts', label: 'Drafts', disabled: true }]} /></div></Example>
      case 'badges': return <Example code={'<Badge>Free</Badge>\n<Badge variant="warning">Waitlist</Badge>\n<Badge variant="success"><Icon name="check" size={12} /> Going</Badge>'}><div className="catalog-row"><Badge>Free</Badge><Badge variant="warning">Waitlist</Badge><Badge variant="success"><Icon name="check" size={12} />Going</Badge><Badge>Sold out</Badge><Badge><Icon name="users" size={12} />124 Going</Badge></div></Example>
      case 'avatars': return <Example code={'<Avatar src="/host.jpg" alt="Shun Harashima" size="md" />\n<Avatar fallback="SH" alt="Shun Harashima" />\n<AvatarGroup>\n  <Avatar src="/first.jpg" alt="First host" />\n  <Avatar src="/second.jpg" alt="Second host" />\n</AvatarGroup>'}><div className="catalog-demo-stack"><div className="catalog-row"><Avatar src={events[0].hostAvatar} alt={events[0].host} size="sm" /><Avatar src={events[0].hostAvatar} alt={events[0].host} /><Avatar src={events[0].hostAvatar} alt={events[0].host} size="lg" /><Avatar fallback="SH" alt="Shun Harashima" /><Avatar src={events[1].hostAvatar} alt={events[1].host} shape="rounded" size="lg" /></div><div className="catalog-row"><AvatarGroup>{events.filter(event => event.hostAvatar).map(event => <Avatar src={event.hostAvatar} alt={event.host} key={event.slug} />)}</AvatarGroup><span className="catalog-muted">124 Going</span></div></div></Example>
      case 'icons': return <Example code={'<Icon name="calendar" size={18} />\n<IconButton aria-label="Save event"><Icon name="heart" /></IconButton>'}><div className="catalog-icon-grid">{iconNames.map(name => <div key={name}><Icon name={name} size={20} /><code>{name}</code></div>)}</div></Example>
      case 'separator': return <Example code={'<p>About this event</p>\n<Separator />\n<p>Your event description.</p>'}><div className="catalog-form"><strong>About this event</strong><Separator /><p className="catalog-muted">Meet the community. Share what you are working on.</p></div></Example>
      case 'event-card': return <><Example code={cardCode}><div className="catalog-wide">{eventCard(0, cardVariant as 'timeline' | 'compact')}</div></Example><div className="catalog-config"><Select label="Card layout" value={cardVariant} onValueChange={setCardVariant} options={[{value:'timeline',label:'Timeline'},{value:'compact',label:'Compact'}]} /><span className="catalog-hint">Click the card to open its event preview.</span></div></>
      case 'registration': return <Example code={'<RegistrationCard\n  description="Welcome! To join the event, please register below."\n  action={<Button onClick={register}>Register</Button>}\n/>'}><div className="catalog-form">{registration()}</div></Example>
      case 'event-preview': return <Example code={'<EventPreview\n  open={open}\n  onClose={() => setOpen(false)}\n  title={event.name}\n  href={event.href}\n  onNext={nextEvent}\n>\n  <EventDetails {...eventDetails} presentation="preview" />\n</EventPreview>'}><div className="catalog-wide">{eventCard(0)}<p className="catalog-hint">Open the card. Try the toolbar, next event, and Escape.</p></div></Example>
      case 'backgrounds': return <><div className="catalog-theme-controls"><Select label="Theme" value={theme} onValueChange={setBackground} options={themeOptions} /><Field label="Tint"><Input type="color" value={tint} onChange={event => setTint(event.target.value)} /></Field><Switch label="Animate background" checked={!paused} onChange={event => setPaused(!event.target.checked)} /></div><Example code={backgroundCode} className="catalog-background-example"><div className="catalog-background-stage"><EventBackground theme={theme} tint={tint} mode="contained" paused={paused} /><div>{eventCard(theme === 'life' ? 1 : theme.startsWith('grain') ? 3 : 0)}</div></div></Example></>
      case 'side-panel': return <Example code={'<SidePanel\n  open={open}\n  onClose={() => setOpen(false)}\n  label="Event settings"\n  toolbar={<PanelHeader />}\n>\n  <YourForm />\n</SidePanel>'}><Button variant="primary" onClick={() => setPanel('settings')}>Open event settings <Icon name="arrow" size={16} /></Button></Example>
      default: return null
    }
  }

  if (fullEvent) return <div className="catalog catalog-event-page"><EventBackground theme={fullEvent.theme} tint={fullEvent.tint} /><header className="catalog-event-nav"><a href="./"><Icon name="chevron" size={14} />Back to components</a><img src={wordmark} alt="Luma" /></header>{eventDetails(fullEvent, 'page')}<SidePanel style={{ '--event-ui-font-family': 'Inter, sans-serif', '--event-ui-focus-color': '#d8d8d8' }} open={panelOpen && panel === 'registration'} onClose={() => setPanel(null)} label="Registration example" toolbar={<PanelHeader title="Registration" close={() => setPanel(null)} />}><RegistrationForm onComplete={() => setAction('Registration form validated. No data was sent.')} /></SidePanel><div className="catalog-notice" role="status">{action}</div></div>

  return <div className="catalog">
    <header className="catalog-header"><a className="catalog-brand" href="#overview"><img src={wordmark} alt="Luma" /><span>/</span><strong>ui</strong></a><div className="catalog-header-right"><span className="catalog-version">React · alpha</span><a href={cloneHref}>View clone <Icon name="arrow" size={14} /></a><IconButton className="catalog-mobile-toggle" id="catalog-navigation-toggle" aria-controls="catalog-component-navigation" aria-label="Toggle component navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Icon name={mobileNav ? 'close' : 'grid'} /></IconButton></div></header>
    <div className="catalog-layout">
      <aside className={`catalog-sidebar ${mobileNav ? 'is-open' : ''}`} aria-label="Component navigation" id="catalog-component-navigation" onClick={event => { if ((event.target as Element).closest('a')) { setMobileNav(false); document.getElementById('main-content')?.focus({ preventScroll: true }) } }}>
        <div className="catalog-search"><Icon name="search" size={15} /><Input aria-label="Search components" placeholder="Search components…" value={search} onChange={event => setSearch(event.target.value)} /></div>
        <nav><div className="catalog-nav-group"><span>Getting started</span>{[{id:'overview',name:'Overview'},{id:'installation',name:'Installation'}].map(item => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined}>{item.name}</a>)}</div>{['Foundations','Event components'].map(group => <div className="catalog-nav-group" key={group}><span>{group}</span>{visibleComponents.filter(component => component.group === group).map(component => <a key={component.id} href={`#${component.id}`} aria-current={page === component.id ? 'page' : undefined}>{component.name}</a>)}</div>)}{visibleComponents.length === 0 && <p className="catalog-hint">No matching components.</p>}</nav>
        <div className="catalog-sidebar-foot"><span className="catalog-status-dot" />Built from the clone</div>
      </aside>

      <main className="catalog-main" id="main-content" tabIndex={-1}>
        <div className="catalog-breadcrumb">Components <Icon name="chevron" size={12} /><span>{selected?.name ?? (page === 'installation' ? 'Installation' : 'Overview')}</span></div>
        <div className="catalog-page-heading"><h1>{selected?.name ?? (page === 'installation' ? 'Installation' : 'Components')}</h1><p>{selected?.description ?? (page === 'installation' ? 'Install the package. Import the styles. Bring your own content.' : 'The building blocks from the Luma clone. Ready to compose.')}</p></div>

        {page === 'overview' ? <>
          <div className="catalog-overview-top"><section className="catalog-feature" aria-label="Event card example"><div className="catalog-section-title"><h2>Event card</h2><a href="#event-card">Explore <Icon name="arrow" size={14} /></a></div><div className="catalog-feature-body">{eventCard(0)}</div><div className="catalog-feature-caption"><code>EventCard</code><span>Click to open the preview</span></div></section><section className="catalog-feature" aria-label="Registration example"><div className="catalog-section-title"><h2>Registration</h2><a href="#registration" aria-label="Explore registration card"><Icon name="arrow" size={14} /></a></div><div className="catalog-feature-body">{registration()}</div><div className="catalog-feature-caption"><code>RegistrationCard</code><span>Your own actions</span></div></section></div>
          <div className="catalog-section-title catalog-foundations-title"><h2>Start with the fundamentals</h2><span>{components.filter(component => component.group === 'Foundations').length} component groups</span></div>
          <div className="catalog-overview-grid">
            <MiniExample title="Buttons" href="#buttons" footer="Variants, sizes & loading states"><div className="catalog-row"><Button variant="primary" size="sm" onClick={() => setPanel('registration')}>Register</Button><Button size="sm" onClick={() => setSubscribed(!subscribed)}>{subscribed ? 'Subscribed' : 'Subscribe'}</Button><IconButton size="sm" aria-label="Save event" aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name={saved ? 'check' : 'heart'} size={16} /></IconButton></div></MiniExample>
            <MiniExample title="Dropdowns" href="#select" footer="Keyboard navigation & custom options"><div className="catalog-row catalog-select-demo"><Select aria-label="Example location" value={location} onValueChange={setLocation} options={[{value:'tokyo',label:'Tokyo'},{value:'new-york',label:'New York'},{value:'online',label:'Online'}]} /><DropdownMenu showChevron={false} label={<Icon name="more" size={18} />} aria-label="Event actions" items={menuItems} align="end" /></div></MiniExample>
            <MiniExample title="Form fields" href="#inputs" footer="Labels, descriptions & validation"><Field label="Email address"><Input type="email" placeholder="you@example.com" /></Field></MiniExample>
            <MiniExample title="Selection controls" href="#toggles" footer="Controlled state & native semantics"><div className="catalog-demo-stack catalog-small-gap"><Checkbox label="Event updates" checked={checked} onChange={event => setChecked(event.target.checked)} /><Switch label="Notifications" checked={notifications} onChange={event => setNotifications(event.target.checked)} /></div></MiniExample>
            <MiniExample title="Avatars & badges" href="#avatars" footer="Host images, groups & event status"><div className="catalog-row"><AvatarGroup>{events.filter(event => event.hostAvatar).map(event => <Avatar key={event.slug} src={event.hostAvatar} alt={event.host} size="sm" />)}</AvatarGroup><Badge variant="warning">Waitlist</Badge><Badge>Free</Badge></div></MiniExample>
            <MiniExample title="Tabs" href="#tabs" footer="Arrow-key navigation & panels"><Tabs aria-label="Sample event tabs" value={eventTab} onValueChange={setEventTab} items={[{value:'upcoming',label:'Upcoming'},{value:'past',label:'Past'},{value:'drafts',label:'Drafts',disabled:true}]} /></MiniExample>
          </div>
          <section className="catalog-background-teaser"><div><h2>The event themes, too.</h2><p>Warp, Life, Grain, and the standard tint surface.</p><a href="#backgrounds">Explore backgrounds <Icon name="arrow" size={15} /></a></div><div className="catalog-theme-strip" aria-hidden="true"><div><EventBackground theme="warp" tint="#120404" mode="contained" /><span>Warp</span></div><div><EventBackground theme="life" tint="#151515" mode="contained" /><span>Life</span></div><div><EventBackground theme="grain-dark" tint="#1848a8" mode="contained" /><span>Grain</span></div></div></section>
          <div className="catalog-quickstart"><h2>Use it in your app</h2><Code>{"import { Button, EventCard, Select } from '@event-ui/react'\nimport '@event-ui/react/styles.css'"}</Code><a href="#installation">Installation instructions <Icon name="arrow" size={14} /></a></div>
        </> : page === 'installation' ? <div className="catalog-installation"><h2>1. Build the local package</h2><Code>{'npm install\nnpm run pack:lib'}</Code><h2>2. Install it in your React 19 app</h2><Code>{'npm install /path/to/artifacts/event-ui-react-0.1.0-alpha.0.tgz'}</Code><h2>3. Import a component and its styles</h2><Code>{"import { Button } from '@event-ui/react'\nimport '@event-ui/react/styles.css'\n\nexport function Register() {\n  return <Button variant=\"primary\">Register</Button>\n}"}</Code><h2>Typography</h2><p>Load your font in the application, then set the shared font token. This catalog loads the same Inter file used in the clone.</p><Code>{':root {\n  --event-ui-font-family: Inter, sans-serif;\n}'}</Code><p className="catalog-hint">This is a local alpha. Demo artwork and font files stay outside the component package.</p></div> : <>{renderComponent()}<div className="catalog-source"><Icon name="code" size={15} /><span>Based on: {selected?.source}</span></div><div className="catalog-usage-note"><h2>Make it yours</h2><p>Import from <code>@event-ui/react</code>. Pass your own content and callbacks. Shared colors and typography use <code>--event-ui-*</code> CSS variables.</p></div></>}
        <footer className="catalog-footer">
          <span>React components · TypeScript · Scoped CSS</span>
          <a href="https://x.com/abelasfaw0" target="_blank" rel="noopener noreferrer" aria-label="Made by Abel · X (opens in a new tab)">Made by Abel · X <Icon name="arrow" size={13} /></a>
          <a href="#installation">Get started <Icon name="arrow" size={13} /></a>
        </footer>
      </main>
    </div>

    <EventPreview style={{ '--event-ui-focus-color': '#d8d8d8', '--event-ui-font-family': 'Inter, sans-serif' }} open={previewOpen} onClose={() => setPreview(null)} title={previewEvent.name} href={`?event=${previewEvent.slug}`} onPrevious={preview !== null && preview > 0 ? () => setPreview(preview - 1) : undefined} onNext={preview !== null && preview < events.length - 1 ? () => setPreview(preview + 1) : undefined}>{eventDetails(previewEvent, 'preview')}</EventPreview>
    <SidePanel open={panelOpen} onClose={() => setPanel(null)} label={panel === 'registration' ? 'Registration example' : 'Event settings'} toolbar={<PanelHeader title={panel === 'registration' ? 'Registration' : 'Event settings'} close={() => setPanel(null)} />} style={{ '--event-ui-panel-width': '440px', '--event-ui-font-family': 'Inter, sans-serif', '--event-ui-focus-color': '#d8d8d8' }}>
      {panel === 'registration' ? <RegistrationForm onComplete={() => setAction('Registration form validated. No data was sent.')} /> : <div className="catalog-panel-content"><h2>Event settings</h2><p>Configure the event background and notifications.</p><Select label="Theme" value={theme} onValueChange={setBackground} options={themeOptions} /><Field label="Tint"><Input type="color" value={tint} onChange={event => setTint(event.target.value)} /></Field><Switch label="Animate background" checked={!paused} onChange={event => setPaused(!event.target.checked)} /><Separator /><Switch label="Email notifications" checked={notifications} onChange={event => setNotifications(event.target.checked)} /><Button variant="primary" onClick={() => { setPanel(null); setAction('Settings saved for this demo session.') }}>Save settings</Button></div>}
    </SidePanel>
    {action && <div className="catalog-notice" role="status"><Icon name="check" size={15} />{action}<IconButton aria-label="Dismiss notification" size="sm" onClick={() => setAction('')}><Icon name="close" size={13} /></IconButton></div>}
  </div>
}

function MiniExample({ title, href, footer, children }: { title: string; href: string; footer: string; children: ReactNode }) {
  return <Card className="catalog-mini"><div className="catalog-section-title"><h3>{title}</h3><a href={href} aria-label={`Explore ${title.toLowerCase()}`}><Icon name="arrow" size={14} /></a></div><CardContent>{children}</CardContent><div className="catalog-mini-footer">{footer}</div></Card>
}

function PanelHeader({ title, close }: { title: string; close: () => void }) {
  return <div className="catalog-panel-header"><strong>{title}</strong><IconButton aria-label={`Close ${title.toLowerCase()}`} size="sm" onClick={close}><Icon name="close" size={16} /></IconButton></div>
}

function RegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [complete, setComplete] = useState(false)
  return <form className="catalog-panel-content" onSubmit={event => { event.preventDefault(); setComplete(true); onComplete() }}><h2>{complete ? 'You’re all set' : 'Register for this event'}</h2><p>{complete ? 'Your form passed validation. No registration was submitted.' : 'Try the form components together. This example does not submit a registration.'}</p>{!complete && <><Field label="Name" required><Input autoComplete="name" placeholder="Your name" required /></Field><Field label="Email" required><Input autoComplete="email" type="email" placeholder="you@example.com" required /></Field><Checkbox label="Send me event updates" defaultChecked /><Button variant="primary" type="submit">Preview registration</Button></>}{complete && <Badge variant="success"><Icon name="check" size={13} />Form validated</Badge>}</form>
}
