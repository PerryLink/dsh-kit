// check-readme-links.mjs — every http(s) link in README.md must resolve.
// Zero-dependency checker: extracts URLs from inline links and bare
// autolinks, then fetches each one (redirects followed) and fails on any
// non-2xx/3xx response.

import { readFileSync } from 'node:fs'

const readme = readFileSync('README.md', 'utf8')

const urls = new Set()
for (const match of readme.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) {
  urls.add(match[1])
}
for (const match of readme.matchAll(/<(https?:\/\/[^>\s]+)>/g)) {
  urls.add(match[1].replace(/[.,;]+$/, ''))
}

const failures = []
const queue = [...urls]
// 8 parallel requests to github.com from one runner produced 7 timeouts on
// 2026-11-08 while every URL was healthy on retry. Keep the concurrency low
// and retry transport errors / 429 / 5xx with backoff so a slow GitHub
// response cannot fail an otherwise healthy README.
const CONCURRENCY = 4
const ATTEMPTS = 3
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length > 0) {
    const url = queue.shift()
    let lastError = ''
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url, { method: 'GET', headers: { 'user-agent': 'dsh-kit-link-check/1.0' }, signal: AbortSignal.timeout(45000) })
        if (response.ok) { lastError = ''; break }
        lastError = `HTTP ${response.status}`
        if (response.status !== 429 && response.status < 500) break
      } catch (error) {
        lastError = String(error?.cause?.code ?? error?.message ?? error)
      }
      if (attempt < ATTEMPTS) await sleep(1500 * attempt)
    }
    if (lastError !== '') failures.push(`${url} -> ${lastError}`)
  }
})
await Promise.all(workers)

if (failures.length > 0) {
  console.error(`broken links (${failures.length}):\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(`links OK: all ${urls.size} URLs resolve`)
