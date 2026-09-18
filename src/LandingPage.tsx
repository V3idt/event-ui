import { useEffect, useRef, useState } from 'react'
import { Avatar, Badge, Button, Card, DropdownMenu, EventBackground, EventCard, EventDetails, EventPreview, Icon, Select, Switch } from '@event-ui/react'
import { events } from '../examples/react/src/data'
import site from '../site.config.json'
import GitHubLink from './GitHubLink'
import './landing.css'

const agentPrompt = `Use Event UI for this project. Read ${site.siteUrl}/llms.txt, then follow its setup and component guidance. Inspect the existing app first, reuse the library's components and styles, and verify the result.`
const example = events[0]

export default function LandingPage() {
  const [paused, setPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [location, setLocation] = useState('tokyo')
  const [reminders, setReminders] = useState(true)
  const [saved, setSaved] = useState(false)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  async function copyInstructions() {
    clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(agentPrompt)
      setCopied(true)
      setCopyFailed(false)
      copyTimer.current = setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
      setCopyFailed(true)
      promptRef.current?.focus()
      promptRef.current?.select()
    }
  }

  return <div className="home">
    <a className="home-skip" href="#home-main">Skip to content</a>
    <header className="home-header">
      <a className="home-brand" href="/" aria-label="Event UI home"><Icon name="grid" size={23} /><span>event<span className="home-brand-slash">/</span>ui</span></a>
      <nav aria-label="Main navigation"><a href="/ui">Components</a><a href="#for-agents">For agents</a><GitHubLink repositoryUrl={site.repositoryUrl} /></nav>
    </header>

    <main id="home-main" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-title">
        <EventBackground theme="warp" tint="#151515" mode="contained" seed={1729} paused={paused} />
        <div className="home-hero-content">
          <a href="/ui#backgrounds" className="home-eyebrow"><span className="home-status-dot" />A small library of good details<Icon name="arrow" size={13} /></a>
          <h1 id="home-title">Give your agent<br /><span>a head start.</span></h1>
          <p className="home-intro">React components for events and the people around them.<br className="home-desktop-break" /> Explore the details. Hand the building to your agent.</p>
          <div className="home-actions">
            <Button variant="primary" size="md" className="home-copy" onClick={copyInstructions}><Icon name={copied ? 'check' : 'copy'} size={17} />{copied ? 'Instructions copied' : 'Copy for your agent'}</Button>
            <a className="home-browse" href="/ui">Browse components<Icon name="arrow" size={17} /></a>
          </div>
          <p className="home-hero-note" role="status">{copied ? 'Paste into your coding agent to get started.' : 'One link. Setup, examples, and the component API.'}</p>
        </div>
        <div className="home-hero-bottom"><div className="home-stack"><span>React 19</span><span>TypeScript</span><span>Scoped CSS</span></div><Button variant="ghost" size="sm" className="home-motion" aria-pressed={paused} onClick={() => setPaused(!paused)}><span className="home-motion-symbol" aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? 'Resume' : 'Pause'}<span className="home-motion-label"> / Warp</span></Button></div>
      </section>

      <section className="home-playground home-section" aria-labelledby="playground-title">
        <div className="home-section-heading"><div><span className="home-kicker">THE COMPONENTS</span><h2 id="playground-title">Small pieces.<br />Thought through.</h2></div><p>From the first button to the event preview.<br />The same components, wherever you use them.</p></div>
        <div className="home-workbench">
          <div className="home-workbench-bar"><span><span className="home-status-dot" />Live components</span><a href="/ui">Explore the library<Icon name="arrow" size={14} /></a></div>
          <div className="home-workbench-body">
            <div className="home-event-example"><div className="home-example-label"><code>EventCard</code><span>Click to preview<Icon name="arrow" size={12} /></span></div><EventCard title={example.name} href={`/ui?event=${example.slug}`} coverUrl={example.image} time="Friday, September 18 · 5:00 PM" hostName={example.host} hostAvatarUrl={example.hostAvatar} location={example.location} badges={[{label:'Waitlist',tone:'warning'}]} going={example.going} onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); setPreviewOpen(true) } }} /></div>
            <div className="home-foundation-example"><div className="home-example-label"><code>Foundations</code><span>Make yourself at home</span></div><div className="home-foundation-row"><Button variant="primary" onClick={() => setPreviewOpen(true)}>View event<Icon name="arrow" size={14} /></Button><Button aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name={saved ? 'check' : 'plus'} size={14} />{saved ? 'Saved' : 'Save'}</Button><DropdownMenu label={<Icon name="more" />} aria-label="Example event options" showChevron={false} align="end" items={[{id:'preview',label:'Preview event',onSelect:()=>setPreviewOpen(true)},{id:'save',label:saved ? 'Remove saved event' : 'Save event',onSelect:()=>setSaved(!saved)}]} /></div><div className="home-foundation-row home-foundation-settings"><Select aria-label="Example city" value={location} onValueChange={setLocation} options={[{value:'tokyo',label:'Tokyo'},{value:'new-york',label:'New York'},{value:'online',label:'Online'}]} /><Badge variant="success">Available</Badge></div><div className="home-foundation-divider" /><Switch label="Event reminders" checked={reminders} onChange={event=>setReminders(event.target.checked)} /></div>
          </div>
          <div className="home-workbench-footer"><span><Icon name="code" size={14} />Your content. Your callbacks.</span><span>Cards · Menus · Forms · Previews · Backgrounds</span></div>
        </div>
      </section>

      <section className="home-agents home-section" id="for-agents" aria-labelledby="agents-title">
        <div className="home-agent-intro"><span className="home-kicker">FOR YOUR AGENT</span><h2 id="agents-title">A link is all<br />you need to share.</h2><p>Give your agent the instructions below. It can read the component API, find examples, and follow the setup for your project.</p><a className="home-text-link" href="/llms.txt">Read the agent guide<Icon name="arrow" size={15} /></a></div>
        <Card className="home-agent-card" padding="none"><div className="home-agent-card-header"><span><Icon name="code" size={16} />Start a conversation</span><span className="home-file-label">llms.txt</span></div><label className="sr-only" htmlFor="agent-prompt">Instructions for your coding agent</label><textarea id="agent-prompt" ref={promptRef} value={agentPrompt} readOnly rows={5} spellCheck={false} onFocus={event=>event.currentTarget.select()} /><div className="home-agent-card-footer"><span role="status">{copyFailed ? 'Copy the selected text to continue.' : copied ? 'Copied. Your agent takes it from here.' : 'Works with agents that can read a URL.'}</span><Button size="sm" onClick={copyInstructions} aria-label="Copy agent instructions"><Icon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Copied' : 'Copy'}</Button></div></Card>
      </section>

      <section className="home-closing home-section"><h2>Prefer to explore first?</h2><p>Every component has a preview. Every preview has the code.</p><a className="home-browse" href="/ui">Open the component library<Icon name="arrow" size={17} /></a></section>
    </main>

    <footer className="home-footer"><div className="home-footer-project"><a className="home-brand" href="/"><Icon name="grid" size={20} /><span>event<span className="home-brand-slash">/</span>ui</span></a><span>An independent UI study inspired by Luma.</span></div><div className="home-footer-links"><a href="/demo">View clone<Icon name="arrow" size={13} /></a><a href="/llms.txt">Agent docs<Icon name="arrow" size={13} /></a></div><div className="home-creator"><a href="https://x.com/abelasfaw0" target="_blank" rel="noopener noreferrer" aria-label="Made by Abel on X"><Avatar src="https://unavatar.io/x/abelasfaw0?fallback=false" alt="Abel" fallback="AA" size="sm" imageProps={{loading:'lazy',decoding:'async',referrerPolicy:'no-referrer'}} /><span>Made by Abel<Icon name="arrow" size={13} /></span></a><a className="home-avatar-credit" href="https://unavatar.io" target="_blank" rel="noopener noreferrer">Avatar via Unavatar</a></div></footer>

    <EventPreview open={previewOpen} onClose={()=>setPreviewOpen(false)} title={example.name} href={`/ui?event=${example.slug}`} style={{'--event-ui-font-family':'Inter, sans-serif','--event-ui-focus-color':'#d8d8d8'}}><EventDetails presentation="preview" title={example.name} coverUrl={example.image} host={{name:example.host,avatarUrl:example.hostAvatar}} date={{month:'Sep',day:18,label:'Friday, September 18',time:'5:00 PM GMT+9'}} location={{name:example.location,detail:'Tokyo, Japan'}} about={<p>{example.description[0]}</p>} registration={{description:'Explore the complete event example in the component library.',action:<a className="home-browse" href={`/ui?event=${example.slug}`}>View event page<Icon name="arrow" size={15} /></a>}} /></EventPreview>
  </div>
}
