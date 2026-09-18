import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, EventBackground, Icon } from '@event-ui/react'
import Brand from '../examples/react/src/Brand'
import ComponentShowcase from './ComponentShowcase'
import site from '../site.config.json'
import GitHubLink from './GitHubLink'
import './landing.css'

const agentPrompt = `Use the UI component library for this project. Read ${site.siteUrl}/llms.txt, then follow its setup and component guidance. Inspect the existing app first, reuse the library's components and styles, and verify the result.`

export default function LandingPage() {
  const [paused, setPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
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
      <a className="home-brand" href="/" aria-label="UI home"><Brand /></a>
      <nav aria-label="Main navigation"><a href="/ui">Components</a><a href="#for-agents">For agents</a><GitHubLink repositoryUrl={site.repositoryUrl} /></nav>
    </header>

    <main id="home-main" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-title">
        <EventBackground theme="warp" tint="#151515" mode="contained" seed={1729} paused={paused} />
        <div className="home-hero-content">
          <a href="/ui#backgrounds" className="home-eyebrow"><span className="home-status-dot" />A small library of good details<Icon name="arrow" size={13} /></a>
          <h1 id="home-title">Your site looks like slop,<br /><span>use this instead.</span></h1>
          <p className="home-intro">React components for whatever you're building.<br className="home-desktop-break" /> Explore the library, or hand it to your coding agent.</p>
          <div className="home-actions">
            <Button variant="primary" size="md" className="home-copy" onClick={copyInstructions}><Icon name={copied ? 'check' : 'copy'} size={17} />{copied ? 'Instructions copied' : 'Copy for your agent'}</Button>
            <a className="home-browse" href="/ui">Browse components<Icon name="arrow" size={17} /></a>
          </div>
          <p className="home-hero-note" role="status">{copied ? 'Paste into your coding agent to get started.' : 'One link. Setup, examples, and the component API.'}</p>
        </div>
        <div className="home-hero-bottom"><div className="home-stack"><span>React 19</span><span>TypeScript</span><span>Scoped CSS</span></div><Button variant="ghost" size="sm" className="home-motion" aria-pressed={paused} onClick={() => setPaused(!paused)}><span className="home-motion-symbol" aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? 'Resume' : 'Pause'}<span className="home-motion-label"> / Warp</span></Button></div>
      </section>

      <ComponentShowcase />

      <section className="home-agents home-section" id="for-agents" aria-labelledby="agents-title">
        <div className="home-agent-intro"><span className="home-kicker">FOR YOUR AGENT</span><h2 id="agents-title">A link is all<br />you need to share.</h2><p>Give your agent the instructions below. It can read the component API, find examples, and follow the setup for your project.</p><a className="home-text-link" href="/llms.txt">Read the agent guide<Icon name="arrow" size={15} /></a></div>
        <Card className="home-agent-card" padding="none"><div className="home-agent-card-header"><span><Icon name="code" size={16} />Start a conversation</span><span className="home-file-label">llms.txt</span></div><label className="sr-only" htmlFor="agent-prompt">Instructions for your coding agent</label><textarea id="agent-prompt" ref={promptRef} value={agentPrompt} readOnly rows={5} spellCheck={false} onFocus={event=>event.currentTarget.select()} /><div className="home-agent-card-footer"><span role="status">{copyFailed ? 'Copy the selected text to continue.' : copied ? 'Copied. Your agent takes it from here.' : 'Works with agents that can read a URL.'}</span><Button size="sm" onClick={copyInstructions} aria-label="Copy agent instructions"><Icon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Copied' : 'Copy'}</Button></div></Card>
      </section>

      <section className="home-closing home-section"><h2>Prefer to explore first?</h2><p>Explore live previews and copy the code.</p><a className="home-browse" href="/ui">Open the component library<Icon name="arrow" size={17} /></a></section>
    </main>

    <footer className="home-footer"><div className="home-footer-project"><a className="home-brand" href="/" aria-label="UI home"><Brand /></a><span>Independent React components. Inspired by Luma.</span></div><div className="home-footer-links"><a href="/demo">Example site<Icon name="arrow" size={13} /></a><a href="/llms.txt">Agent docs<Icon name="arrow" size={13} /></a></div><div className="home-creator"><a href="https://x.com/abelasfaw0" target="_blank" rel="noopener noreferrer" aria-label="Made by Abel on X"><Avatar src="https://unavatar.io/x/abelasfaw0?fallback=false" alt="Abel" fallback="AA" size="sm" imageProps={{loading:'lazy',decoding:'async',referrerPolicy:'no-referrer'}} /><span>Made by Abel<Icon name="arrow" size={13} /></span></a><a className="home-avatar-credit" href="https://unavatar.io" target="_blank" rel="noopener noreferrer">Avatar via Unavatar</a></div></footer>


  </div>
}
