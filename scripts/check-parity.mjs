// check-parity.mjs — the roster has one source of truth (plugins.txt) and
// everything that states a number derives from it.
//
// The file keeps its old name because the CI step invokes this exact path, and
// editing a workflow file needs a `workflow` token scope this project's
// automation does not carry. Its job name still reads "plugin list parity (15
// plugins)" for the same reason - cosmetic, and fixable by whoever holds that
// scope. What it replaced: a check that compared two hand-maintained package
// lists and asserted `=== 37`. When a commit removed one plugin from both lists
// and left the constant alone, the gate went red on main and the README kept
// saying 40 for a week. Deriving is the fix: this script reads the roster, then
// holds both installers and every count in README.md to it.
//
// Usage:
//   node scripts/check-parity.mjs            # verify (CI runs this)
//   node scripts/check-parity.mjs --write    # rewrite README.md's counts
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

/** The four ecosystem repositories that are not installable plugins. */
const RESOURCES = ['dsh-catalog', 'dsh-plugin-certification', 'dsh-plugin-portal']
const SPEC = /^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/

const read = (rel) => readFileSync(join(root, rel), 'utf8')

// --- the roster ------------------------------------------------------------

const rosterText = read('plugins.txt')
const roster = rosterText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

if (roster.length === 0) failures.push('plugins.txt lists no packages')
const seen = new Set()
for (const spec of roster) {
  if (!SPEC.test(spec)) failures.push(`plugins.txt: "${spec}" is not a valid npm spec`)
  if (seen.has(spec)) failures.push(`plugins.txt: duplicate "${spec}"`)
  seen.add(spec)
}
const deprecated = roster.filter((spec) => spec === 'dsh-plugin-upgrade-015' || spec === 'dsh-plugin-upgrade-rc1')
for (const spec of deprecated) failures.push(`plugins.txt lists the deprecated name "${spec}"`)

// --- no installer may carry its own list ----------------------------------

for (const file of ['install-all.sh', 'install-all.ps1']) {
  const text = read(file)
  if (!text.includes('plugins.txt')) failures.push(`${file} does not read plugins.txt`)
  const inline = text
    .split(/\r?\n/)
    .filter((line) => /^\s*['"]?(?:@perrylink\/)?dsh-[a-z0-9-]+['"]?,?\s*$/.test(line))
  if (inline.length > 0) {
    failures.push(`${file} hard-codes ${inline.length} package name(s): ${inline.map((l) => l.trim()).join(', ')}`)
  }
}

// --- README numbers -------------------------------------------------------

const countPatterns = [
  ['the headline', /\*\*One-command starter pack: install all (\d+) PerryLink DeepSeek Harness plugins\.\*\*/],
  ['the highlights heading', /the installers cover the full (\d+)-plugin family/],
  ['the family blurb', /one of the \[(\d+) DeepSeek Harness plugins\]/],
]

let readme = read('README.md')
if (process.argv.includes('--write')) {
  for (const [, pattern] of countPatterns) {
    readme = readme.replace(pattern, (match, digits) => match.replace(digits, String(roster.length)))
  }
  writeFileSync(join(root, 'README.md'), readme, 'utf8')
  console.log(`check-parity: wrote README.md counts as ${roster.length}`)
} else {
  for (const [label, pattern] of countPatterns) {
    const match = readme.match(pattern)
    if (!match) {
      failures.push(`README.md: ${label} no longer states a plugin count; update this gate`)
      continue
    }
    if (Number(match[1]) !== roster.length) {
      failures.push(`README.md: ${label} says ${match[1]}, plugins.txt has ${roster.length} (run: node scripts/check-parity.mjs --write)`)
    }
  }
}

// The family table is a hand-maintained Markdown table of `**[name](url)**`
// rows. Two invariants: it must cover the roster plus the ecosystem resources
// and nothing else, and it must never link to a third party — dsh-wechat sat in
// it as a friendly collaboration until 2026-09-20, and a list headed "PerryLink
// DSH Plugin Family" is the wrong place for someone else's package.
const tableRows = [...readme.matchAll(/^\| \*\*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\*\* \|/gm)]
  .map(([, name, url]) => ({ name, url }))
if (tableRows.length === 0) failures.push('README.md: the family table has no rows')
const tableSlugs = tableRows.map((row) => row.url.replace('https://github.com/', ''))
for (const slug of tableSlugs) {
  if (!slug.startsWith('PerryLink/')) failures.push(`README.md family table lists a third-party repository: ${slug}`)
}
for (const slug of tableSlugs) {
  if (tableSlugs.filter((s) => s === slug).length > 1) failures.push(`README.md family table lists ${slug} twice`)
}
const tableRepos = new Set(tableSlugs.map((slug) => slug.split('/')[1]))
if (!tableRepos.has('dsh-plugin-upgrade')) failures.push('README.md family table must carry dsh-plugin-upgrade (the retired -015 row is not a substitute)')
if (tableRepos.has('dsh-wechat')) failures.push('README.md family table still carries dsh-wechat, which is not a PerryLink package')
for (const resource of RESOURCES) {
  if (!tableRepos.has(resource)) failures.push(`README.md family table dropped the ecosystem repository ${resource}`)
}

if (failures.length > 0) {
  console.error(`check-parity: FAIL (${failures.length})`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(
  `check-parity: ok — plugins.txt has ${roster.length} specs, both installers read it, ` +
    `README.md states ${roster.length} in 3 places, and the family table carries ${tableRows.length} PerryLink repositories`,
)
