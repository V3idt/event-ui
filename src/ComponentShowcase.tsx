import { useState, type ReactNode } from 'react'
import {
  Avatar, Badge, Button, Card, Checkbox, DropdownMenu, EventBackground,
  Field, Icon, IconButton, Input, Select, SidePanel, Switch, Tabs,
  type EventBackgroundTheme,
} from '@event-ui/react'

const backgrounds: { value: EventBackgroundTheme; label: string; tint: string }[] = [
  { value: 'warp', label: 'Warp', tint: '#151515' },
  { value: 'life', label: 'Life', tint: '#53565b' },
  { value: 'grain-dark', label: 'Grain', tint: '#68635d' },
]

function DemoLabel({ children, href }: { children: ReactNode; href: string }) {
  return <div className="showcase-label"><code>{children}</code><a href={href} aria-label={`Explore ${children}`}>Explore<Icon name="arrow" size={13} /></a></div>
}

export default function ComponentShowcase() {
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex@example.com')
  const [role, setRole] = useState('designer')
  const [saved, setSaved] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [tab, setTab] = useState('general')
  const [notifications, setNotifications] = useState(true)
  const [updates, setUpdates] = useState(false)
  const [message, setMessage] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [theme, setTheme] = useState<EventBackgroundTheme>('life')
  const [paused, setPaused] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [project, setProject] = useState('Untitled project')
  const [sharing, setSharing] = useState(false)
  const background = backgrounds.find(item => item.value === theme)!

  return <section className="home-playground home-section" id="components" aria-labelledby="playground-title">
    <div className="home-section-heading">
      <div><span className="home-kicker">THE COMPONENTS</span><h2 id="playground-title">Try them out.</h2></div>
      <p>Working components, right here.<br />Use the same pieces in your own project.</p>
    </div>

    <div className="showcase-grid">
      <div className="showcase-tile showcase-profile">
        <DemoLabel href="/ui#cards">Cards &amp; forms</DemoLabel>
        <Card className="showcase-profile-card">
          <div className="showcase-profile-heading">
            <Avatar alt={name || 'Your profile'} size="lg" shape="rounded" />
            <div><h3>{name || 'Your profile'}</h3><p>Personal account</p></div>
            <Badge>{role[0].toUpperCase() + role.slice(1)}</Badge>
          </div>
          <form onSubmit={event => { event.preventDefault(); setProfileMessage('Changes saved in this preview.') }}>
            <Field label="Display name" required><Input value={name} onChange={event => { setName(event.target.value); setProfileMessage('') }} autoComplete="off" /></Field>
            <Field label="Email address" required><Input type="email" value={email} onChange={event => { setEmail(event.target.value); setProfileMessage('') }} autoComplete="off" /></Field>
            <div className="showcase-profile-footer"><span role="status">{profileMessage}</span><Button type="submit" size="sm" variant="primary">Save changes</Button></div>
          </form>
        </Card>
      </div>

      <div className="showcase-tile showcase-controls">
        <DemoLabel href="/ui#buttons">Buttons &amp; controls</DemoLabel>
        <div className="showcase-button-row">
          <Button variant="primary" onClick={() => setMessage('Ready for the next step.')}>Continue<Icon name="arrow" size={15} /></Button>
          <Button aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name={saved ? 'check' : 'plus'} size={15} />{saved ? 'Saved' : 'Save'}</Button>
          <IconButton aria-label="Favorite this example" aria-pressed={favorite} onClick={() => setFavorite(!favorite)}><Icon name={favorite ? 'check' : 'heart'} size={18} /></IconButton>
          <DropdownMenu label={<Icon name="more" size={18} />} aria-label="More actions" showChevron={false} align="end" items={[
            { id: 'settings', label: 'Open settings', icon: <Icon name="filter" size={15} />, onSelect: () => setPanelOpen(true) },
            { id: 'reset', label: 'Reset controls', onSelect: () => { setSaved(false); setFavorite(false); setNotifications(true); setUpdates(false); setRole('designer'); setMessage('Controls reset.') } },
          ]} />
        </div>
        <div className="showcase-badges"><Badge>Draft</Badge><Badge variant="success">Published</Badge><Badge variant="warning">In review</Badge></div>
        <Tabs aria-label="Example preferences" value={tab} onValueChange={setTab} items={[
          { value: 'general', label: 'General', content: <div className="showcase-tab-content"><Select label="Your role" value={role} onValueChange={setRole} options={[{ value: 'designer', label: 'Designer' }, { value: 'developer', label: 'Developer' }, { value: 'creator', label: 'Creator' }]} /><Switch label="Email notifications" checked={notifications} onChange={event => setNotifications(event.target.checked)} /></div> },
          { value: 'notifications', label: 'Notifications', content: <div className="showcase-tab-content"><Switch label="Email notifications" checked={notifications} onChange={event => setNotifications(event.target.checked)} /><Checkbox label="Product updates" description="Occasional news about what is new." checked={updates} onChange={event => setUpdates(event.target.checked)} /></div> },
        ]} />
        <p className="showcase-feedback" role="status">{message}</p>
      </div>

      <div className="showcase-tile showcase-motion">
        <DemoLabel href="/ui#backgrounds">Animated backgrounds</DemoLabel>
        <div className="showcase-background">
          <EventBackground theme={theme} tint={background.tint} mode="contained" paused={paused} />
          <span className="showcase-background-name">{background.label}</span>
          <Button className="showcase-pause" variant="ghost" size="sm" aria-label={paused ? 'Resume background preview' : 'Pause background preview'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</Button>
        </div>
        <Tabs aria-label="Background preview" value={theme} onValueChange={value => setTheme(value as EventBackgroundTheme)} items={backgrounds.map(({ value, label }) => ({ value, label }))} />
      </div>

      <div className="showcase-tile showcase-panel-example">
        <DemoLabel href="/ui#side-panel">Side panel</DemoLabel>
        <div className="showcase-panel-illustration" aria-hidden="true">
          <div className="showcase-window-lines"><i /><i /><i /></div>
          <div className="showcase-drawer-lines"><span /><i /><i /><b /></div>
        </div>
        <div className="showcase-panel-caption"><div><h3>A little more room.</h3><p>Settings, details, whatever comes next.</p></div><Button size="sm" onClick={() => setPanelOpen(true)}>Open panel<Icon name="arrow" size={14} /></Button></div>
      </div>
    </div>
    <div className="showcase-bottom"><span>Cards · Fields · Buttons · Menus · Tabs · Backgrounds</span><a href="/ui">Browse all components<Icon name="arrow" size={15} /></a></div>

    <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} label="Project settings" className="showcase-panel" style={{ '--event-ui-font-family': 'Inter, sans-serif', '--event-ui-focus-color': '#d8d8d8' }} toolbar={<><strong>Project settings</strong><IconButton aria-label="Close project settings" onClick={() => setPanelOpen(false)}><Icon name="close" size={18} /></IconButton></>}>
      <form className="showcase-panel-form" onSubmit={event => { event.preventDefault(); setPanelOpen(false); setMessage(`Settings updated for ${project}.`) }}>
        <h2>Make it yours.</h2><p>A side panel keeps the details close without leaving the page.</p>
        <Field label="Project name" required><Input value={project} onChange={event => setProject(event.target.value)} /></Field>
        <Switch label="Share project" description="Allow your team to view this project." checked={sharing} onChange={event => setSharing(event.target.checked)} />
        <Button type="submit" variant="primary">Save settings</Button>
      </form>
    </SidePanel>
  </section>
}
