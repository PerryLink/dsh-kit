#!/usr/bin/env node
// Validate the 117-package family install roster.
// The full roster lives in family.txt; install-family.* must read it, not
// hard-code a package list.
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const text = readFileSync(join(root, 'family.txt'), 'utf8')
const lines = text.split(/\r?\n/)
const specs = []
const comment = []
for (const raw of lines) {
  const line = raw.trim()
  if (!line) continue
  if (line.startsWith('#')) { comment.push(line); continue }
  specs.push(line.replace(/\s+#.*$/, '').trim())
}
const expected = 117
if (specs.length !== expected) failures.push(`family.txt has ${specs.length} specs, expected ${expected}`)
if (new Set(specs).size !== specs.length) failures.push('family.txt has duplicate specs')
const retired = ['dsh-background-agents', 'dsh-session-pin', 'dsh-team-rooms']
for (const r of retired) if (specs.includes(r)) failures.push(`family.txt lists retired ${r}`)
for (const s of ['dsh-finops-suite', 'dsh-contract-suite']) if (specs.includes(s)) failures.push(`family.txt lists suite ${s}; list members instead`)
for (const s of specs) {
  if (!/^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(s)) failures.push(`family.txt invalid spec ${s}`)
}
for (const f of ['install-family.sh', 'install-family.ps1']) {
  const body = readFileSync(join(root, f), 'utf8')
  if (!body.includes('family.txt')) failures.push(`${f} does not read family.txt`)
  const inline = body.split(/\r?\n/).filter((line) => /^\s*['"]?(?:@perrylink\/)?dsh-[a-z0-9-]+['"]?,?\s*$/.test(line))
  if (inline.length) failures.push(`${f} hard-codes ${inline.length} package name(s)`)
}
if (failures.length) {
  console.error(`FAIL ${failures.length} family checks:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`family ok: ${specs.length} install specs; sections: ${comment.filter((x) => x.includes('──')).join(' | ')}`)
