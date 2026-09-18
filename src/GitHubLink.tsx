import { useEffect, useState } from 'react'

export function GitHubMark() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.57.1.78-.25.78-.55v-2.1c-3.17.69-3.84-1.35-3.84-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.53-.29-5.19-1.27-5.19-5.64 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.13 1.17a10.9 10.9 0 0 1 5.7 0c2.17-1.48 3.12-1.17 3.12-1.17.63 1.57.23 2.73.12 3.02.73.8 1.17 1.82 1.17 3.06 0 4.38-2.67 5.35-5.21 5.63.41.36.77 1.05.77 2.12v3.11c0 .3.2.66.79.55A11.4 11.4 0 0 0 12 .8Z" /></svg>
}

export default function GitHubLink({ repositoryUrl }: { repositoryUrl: string | null }) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    setStars(null)
    if (!repositoryUrl) return
    const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(repositoryUrl)
    if (!match) return
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 6000)
    fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    }).then(response => {
      if (!response.ok) throw new Error('Repository information unavailable')
      return response.json()
    }).then((data: { stargazers_count?: unknown }) => {
      if (!controller.signal.aborted && typeof data.stargazers_count === 'number' && Number.isSafeInteger(data.stargazers_count) && data.stargazers_count >= 0) setStars(data.stargazers_count)
    }).catch(() => {
      // The repository link remains useful when GitHub is unavailable or rate limited.
    }).finally(() => window.clearTimeout(timeout))
    return () => { controller.abort(); window.clearTimeout(timeout) }
  }, [repositoryUrl])

  if (!repositoryUrl) return <span className="home-github home-github-pending" title="The repository is being prepared"><GitHubMark />GitHub<span className="home-repo-status">soon</span></span>

  return <a className="home-github" href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={stars === null ? 'View GitHub repository' : `View GitHub repository, ${stars.toLocaleString()} stars`}>
    <GitHubMark /><span className="home-github-label">GitHub</span>
    {stars !== null && <span className="home-stars"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z" /></svg>{stars.toLocaleString()}</span>}
  </a>
}
