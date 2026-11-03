#!/usr/bin/env node
// Publish gate: only installable, non-frozen packages may be auto-published.
// Usage: node scripts/publish-gate.mjs <package> [--allow-frozen]
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [pkg, ...rest] = process.argv.slice(2)
if (!pkg) { console.error('usage: node scripts/publish-gate.mjs <package> [--allow-frozen]'); process.exit(2) }
const allowFrozen = rest.includes('--allow-frozen')
const lines = readFileSync(join(root, 'plugins.txt'), 'utf8').split(/\r?\n/)
const spec = lines.map(l => l.trim()).find(l => l && !l.startsWith('#') && l.replace(/\s+#.*$/, '').trim() === pkg)
if (!spec) { console.error(`BLOCK ${pkg}: not in plugins.txt (retired/pointer/support/not installable)`); process.exit(1) }
if (/frozen/i.test(spec) && !allowFrozen) { console.error(`BLOCK ${pkg}: frozen; owner override required (--allow-frozen)`); process.exit(1) }
console.log(`PASS ${pkg}: installable and not frozen`)
