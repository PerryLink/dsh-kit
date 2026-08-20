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
const CONCURRENCY = 8
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length > 0) {
    const url = queue.shift()
    try {
      const response = await fetch(url, { method: 'GET', headers: { 'user-agent': 'dsh-kit-link-check/1.0' }, signal: AbortSignal.timeout(30000) })
      if (!response.ok) failures.push(`${url} -> HTTP ${response.status}`)
    } catch (error) {
      failures.push(`${url} -> ${error?.cause?.code ?? error?.message ?? String(error)}`)
    }
  }
})
await Promise.all(workers)

if (failures.length > 0) {
  console.error(`broken links (${failures.length}):\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(`links OK: all ${urls.size} URLs resolve`)
