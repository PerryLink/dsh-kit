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
// It also guards the two failures this file was extended for (2026-10-07):
//   * a retired, npm-deprecated package coming back into a fresh install, and
//   * a family-table row losing its Status cell, which makes GitHub drop the
//     retirement annotation from the rendered table without any visible error.
//
// Usage:
//   node scripts/check-parity.mjs            # verify (CI runs this)
//   node scripts/check-parity.mjs --write    # rewrite README.md's counts
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

/** The three ecosystem repositories that are not installable plugins. */
const RESOURCES = ['dsh-catalog', 'dsh-plugin-certification', 'dsh-plugin-portal']
const SPEC = /^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/

/**
 * 🚫 Retired: npm-deprecated, no further fixes or releases.
 * `roster` are the ones the family roster counts; `corridor` are the three
 * version-locked corridor legs, which were never roster members. None of them
 * may appear in plugins.txt, and all of them stay on npm for existing installs.
 * `-rc1` was missing from this object until 2026-10-08 although it was retired
 * on the same day as the other two and is npm-deprecated in the same way, so
 * the gate would not have caught it coming back.
 */
const RETIRED = {
  roster: ['dsh-background-agents', 'dsh-session-pin', 'dsh-team-rooms'],
  corridor: ['dsh-plugin-upgrade-015', 'dsh-plugin-upgrade-016', 'dsh-plugin-upgrade-rc1'],
}
const RETIRED_SPECS = [...RETIRED.roster, ...RETIRED.corridor]

/** npm spec -> repository name, for the specs that are not named after their repo. */
const REPO_OF = {
  '@perrylink/dsh-github': 'dsh-github',
  '@perrylink/dsh-plugin-doctor': 'dsh-plugin-doctor',
  '@perrylink/dsh-plugin-kit': 'dsh-plugin-kit',
  '@perrylink/dsh-skill-pack-security-provider': 'dsh-skill-pack-security',
  '@perrylink/dsh-ticktick': 'dsh-ticktick',
}
const repoOf = (spec) => REPO_OF[spec] ?? spec

const read = (rel) => readFileSync(join(root, rel), 'utf8')

// --- the roster ------------------------------------------------------------

const rosterText = read('plugins.txt')
const roster = []
const frozen = []
const optIn = []
for (const raw of rosterText.split(/\r?\n/)) {
  const line = raw.trim()
  if (!line || line.startsWith('#')) continue
  // A trailing "# ..." comment records the package's maintenance status.
  const spec = line.replace(/\s+#.*$/, '').trim()
  roster.push(spec)
  if (/#\s*🧊\s*FROZEN/.test(line)) frozen.push(spec)
  // `# opt-in` means the installers skip it unless asked. It still counts as a
  // roster plugin; what it does not count as is something a one-line starter
  // pack installs by default.
  if (/#\s*opt-in/.test(line)) optIn.push(spec)
}

if (roster.length === 0) failures.push('plugins.txt lists no packages')
const seen = new Set()
for (const spec of roster) {
  if (!SPEC.test(spec)) failures.push(`plugins.txt: "${spec}" is not a valid npm spec`)
  if (seen.has(spec)) failures.push(`plugins.txt: duplicate "${spec}"`)
  seen.add(spec)
}

// The regression gate: a retired package must never be installable again.
for (const spec of roster) {
  if (RETIRED_SPECS.includes(spec)) {
    failures.push(`plugins.txt lists the RETIRED package "${spec}" — retired packages are not installable`)
  }
}
// ...and the frozen set is exactly the six the family documents.
const FROZEN_REPOS = ['dsh-budget', 'dsh-memento', 'dsh-draw', 'dsh-claude-move', 'dsh-reach', 'dsh-defend']
const frozenRepos = frozen.map(repoOf).sort()
if (frozenRepos.join(',') !== [...FROZEN_REPOS].sort().join(',')) {
  failures.push(`plugins.txt marks ${frozenRepos.length} frozen package(s) [${frozenRepos.join(', ')}], expected the 6: ${FROZEN_REPOS.join(', ')}`)
}

const installCount = roster.length
const frozenCount = frozen.length
const activeCount = installCount - frozenCount
const rosterCount = installCount + RETIRED.roster.length
const optInCount = optIn.length
const defaultInstallCount = installCount - optInCount
const counts = {
  installCount,
  frozenCount,
  activeCount,
  rosterCount,
  optInCount,
  defaultInstallCount,
  retiredRosterCount: RETIRED.roster.length,
}

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
  // Both installers strip the trailing status comment before calling dsh.
  if (!text.includes('#.*$') && !text.includes('%%#*')) {
    failures.push(`${file} does not strip the trailing "# ..." status comment from plugins.txt`)
  }
}

// --- README numbers -------------------------------------------------------

const countPatterns = [
  ['the headline active count', /\*\*One-command starter pack: (\d+) actively maintained/, counts.activeCount],
  ['the headline install count', /plus (\d+) frozen ones kept installable — (\d+) npm specs/, counts.frozenCount, counts.installCount],
  ['the highlights heading', /the installers cover (\d+) npm specs, plus (\d+) opt-in/, counts.defaultInstallCount, counts.optInCount],
  ['the family blurb (active)', /one of the \*\*(\d+) actively maintained\*\*/, counts.activeCount],
  ['the family blurb (roster)', /the roster is \*\*(\d+)\*\*, of which \*\*(\d+)\*\* are frozen and \*\*(\d+)\*\* retired/, counts.rosterCount, counts.frozenCount, counts.retiredRosterCount],
]

let readme = read('README.md')
if (process.argv.includes('--write')) {
  readme = readme.replace(countPatterns[0][1], (m, d) => m.replace(d, String(counts.activeCount)))
  readme = readme.replace(countPatterns[1][1], (m, a, b) => m.replace(a, String(counts.frozenCount)).replace(b, String(counts.installCount)))
  readme = readme.replace(countPatterns[2][1], (m, a, b) =>
    m.replace(a, String(counts.defaultInstallCount)).replace(b, String(counts.optInCount)))
  readme = readme.replace(countPatterns[3][1], (m, d) => m.replace(d, String(counts.activeCount)))
  readme = readme.replace(countPatterns[4][1], (m, a, b, c) =>
    m.replace(a, String(counts.rosterCount)).replace(b, String(counts.frozenCount)).replace(c, String(counts.retiredRosterCount)))
  writeFileSync(join(root, 'README.md'), readme, 'utf8')
  console.log(`check-parity: wrote README.md counts as ${activeCount} active / ${frozenCount} frozen / ${installCount} specs / roster ${rosterCount}`)
} else {
  for (const [label, pattern, ...expected] of countPatterns) {
    const match = readme.match(pattern)
    if (!match) {
      failures.push(`README.md: ${label} no longer states a count; update this gate`)
      continue
    }
    expected.forEach((want, i) => {
      if (Number(match[i + 1]) !== want) {
        failures.push(`README.md: ${label} says ${match[i + 1]}, plugins.txt derives ${want} (run: node scripts/check-parity.mjs --write)`)
      }
    })
  }
}

// --- the family table -----------------------------------------------------
//
// A hand-maintained Markdown table of `**[name](url)**` rows. Invariants: every
// row has the SAME number of cells as the header (a row with an extra cell
// silently loses its last cell when GitHub renders it, which is how the frozen
// annotations disappeared), it never links to a third party, and the retirement
// status it shows matches the roster: exactly the frozen and retired rows carry
// one, and no active row does.
const tableHeader = readme.match(/^\| Plugin \| One-liner \| Status \|\s*$/m)
if (!tableHeader) failures.push('README.md: the family table header is no longer "| Plugin | One-liner | Status |"')
const headerCells = tableHeader ? tableHeader[0].split('|').length - 2 : 0

const tableRows = [...readme.matchAll(/^\| \*\*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\*\* \|(.*)$/gm)]
  .map(([, name, url, rest]) => {
    const cells = rest.replace(/\|\s*$/, '').split('|').map((c) => c.trim())
    return { name, url, cellCount: cells.length + 1, status: cells[cells.length - 1] ?? '' }
  })
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

for (const row of tableRows) {
  if (headerCells && row.cellCount !== headerCells) {
    failures.push(`README.md family table: ${row.name} has ${row.cellCount} cells but the header has ${headerCells} — GitHub drops the extra cell, taking the status with it`)
  }
}
// Every row needs a status cell, so the split above always yields one.
const statusOf = new Map(tableRows.map((row) => [row.name, row.status]))
for (const spec of frozen) {
  const repo = repoOf(spec)
  if (!statusOf.get(repo)) failures.push(`README.md family table: ${repo} is frozen in plugins.txt but its row carries no status`)
}
for (const repo of RETIRED.roster) {
  const status = statusOf.get(repo)
  if (!status) failures.push(`README.md family table: ${repo} is retired but its row carries no status`)
  else if (!/RETIRED/.test(status)) failures.push(`README.md family table: ${repo} is retired but its status does not say RETIRED`)
}
const marked = new Set([...frozen.map(repoOf), ...RETIRED.roster])
for (const row of tableRows) {
  if (!marked.has(row.name) && row.status) {
    failures.push(`README.md family table: ${row.name} is neither frozen nor retired but its row carries the status "${row.status}"`)
  }
}

if (failures.length > 0) {
  console.error(`check-parity: FAIL (${failures.length})`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(
  `check-parity: ok — plugins.txt has ${installCount} specs ` +
    `(${activeCount} active + ${frozenCount} frozen, roster ${rosterCount}, ${RETIRED_SPECS.length} retired excluded), ` +
    `both installers read it and strip the status comment, README.md states ${activeCount}/${frozenCount}/${installCount}/${rosterCount} in 5 places, ` +
    `and the family table carries ${tableRows.length} PerryLink repositories, every row ${headerCells} cells wide with the right status`,
)
