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
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
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
// ...and the frozen set is exactly the five the family documents.
const FROZEN_REPOS = ['dsh-budget', 'dsh-draw', 'dsh-claude-move', 'dsh-reach', 'dsh-defend', 'dsh-autotier', 'dsh-cert-mcp', 'dsh-community-bench']
const frozenRepos = frozen.map(repoOf).sort()
if (frozenRepos.join(',') !== [...FROZEN_REPOS].sort().join(',')) {
  failures.push(`plugins.txt marks ${frozenRepos.length} frozen package(s) [${frozenRepos.join(', ')}], expected the ${FROZEN_REPOS.length}: ${FROZEN_REPOS.join(', ')}`)
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
// The 2026-10-19 roster intentionally ships no family counts in prose; only the
// roster rows themselves are authoritative. Keep the derived counts available
// for --write and diagnostics, but do not require a number in README.md.

let readme = read('README.md')

// --- the family table -----------------------------------------------------
//
// A hand-maintained Markdown table of `**[name](url)**` rows. Invariants: every
// row has the SAME number of cells as the header (a row with an extra cell
// silently loses its last cell when GitHub renders it, which is how the frozen
// annotations disappeared), it never links to a third party, and the retirement
// status it shows matches the roster: exactly the frozen and retired rows carry
// one, and no active row does.
const familyStart = readme.search(/^## PerryLink DSH Plugin Family$/m)
const familySection = familyStart === -1 ? '' : readme.slice(familyStart)
const tableHeader = familySection.match(/^\| Plugin \| Status \|\s*$/m)
if (!tableHeader) failures.push('README.md: the family table header is not a recognized 2-column family table')
const headerCells = tableHeader ? tableHeader[0].split('|').length - 2 : 0

const tableRows = [...familySection.matchAll(/^\| \*\*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\*\* \|(.*)$/gm)]
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
if (!tableRepos.has('dsh-codemod')) failures.push('README.md family table must carry dsh-codemod (the retired -015 row is not a substitute)')
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

// --- family counts in the sibling repositories -----------------------------
//
// The family states a count in five repositories. Until 2026-10-13 only this one was
// gated: this script read this README and nothing else, so a wrong number in
// dsh-catalog's manifest, dsh-plugin-certification's markers, dsh-plugin-portal's
// roster copy or dsh-plugin-doctor's badge roster could sit there indefinitely — and
// three READMEs did sit there stating 33 active / 6 frozen while plugins.txt marked 34
// and 5. Every sibling number is now derived from plugins.txt (or from the roster file
// that carries it) and compared, and every README's family blurb must state one of the
// two documented scopes below and nothing else.
//
// A sibling checkout is optional on purpose. This repository's own CI holds dsh-kit
// alone, and a gate that is red on every runner is not a gate, so an absent sibling is
// reported as SKIP. `--require-family` turns that into a failure for a workspace job
// that checks the family out side by side; `--family-root <dir>` (or
// DSH_FAMILY_WORKSPACE) points at the directory the siblings live in.
//
// The two documented scopes, both derived from plugins.txt:
//   default scope — what `install-all.sh` installs with no flag, plus the retired
//     roster members; this is the scope the per-plugin READMEs state.
//   full scope — every spec in plugins.txt, checkers included; dsh-kit states this.
const SCOPES = {
  default: {
    active: defaultInstallCount - frozenCount,
    roster: defaultInstallCount + RETIRED.roster.length,
    frozen: frozenCount,
    retired: RETIRED.roster.length,
    label: 'default install scope (opt-in checkers excluded)',
  },
  full: {
    active: activeCount,
    roster: rosterCount,
    frozen: frozenCount,
    retired: RETIRED.roster.length,
    label: 'full scope (53 opt-in checkers included)',
  },
}
const scopeTuples = Object.values(SCOPES).map((s) => [s.active, s.roster, s.frozen, s.retired].join('/'))

const familyRoot = resolve(
  process.argv.includes('--family-root')
    ? (process.argv[process.argv.indexOf('--family-root') + 1] ?? '')
    : (process.env.DSH_FAMILY_WORKSPACE ?? join(root, '..')),
)
const requireFamily = process.argv.includes('--require-family')
const skips = []
const familyHas = (rel) => existsSync(join(familyRoot, rel))
const familyRead = (rel) => readFileSync(join(familyRoot, rel), 'utf8').replace(/^\uFEFF/, '')
const familyJson = (rel) => JSON.parse(familyRead(rel))
const requireSibling = (rel, why) => {
  if (familyHas(rel)) return true
  skips.push(`${rel} — ${why}`)
  if (requireFamily) failures.push(`family: --require-family was passed but ${rel} is absent (${why})`)
  return false
}

// The roster every sibling has to agree with. `dsh-plugin-kit/data/repos.json` is the
// machine-readable copy of the same 95 repositories as plugins.txt, but it splits them
// differently: `dsh-plugin-kit` itself carries role `infra` (one entry), and the two
// retired corridor legs (dsh-plugin-upgrade-015/016) are deliberately absent from it —
// they were never roster members. So the identity is `entries == rosterCount`,
// `non-infra == rosterCount - 1`, and the statuses are compared over the non-infra
// entries with the infra spec removed. It also carries a per-repo `status`, which is
// what certification's markers and the portal's cards are rendered from.
const KIT_ROSTER = 'dsh-kit/data/repos.json'
let kitRoster = null
const INFRA_SPECS = ['@perrylink/dsh-plugin-kit']
if (requireSibling(KIT_ROSTER, 'the machine-readable family roster the siblings count')) {
  kitRoster = familyJson(KIT_ROSTER)
  const names = new Set(kitRoster.repos.map((entry) => entry.name))
  for (const spec of roster) {
    const repo = repoOf(spec)
    if (!names.has(repo)) failures.push(`family: plugins.txt lists ${spec} but ${KIT_ROSTER} has no entry for ${repo}`)
  }
  for (const repo of RETIRED.roster) {
    if (!names.has(repo)) failures.push(`family: retired roster member ${repo} is missing from ${KIT_ROSTER}`)
  }
  const infraEntries = kitRoster.repos.filter((entry) => entry.role === 'infra')
  const pluginRepos = kitRoster.repos.filter((entry) => entry.role !== 'infra').length
  const byStatus = { active: 0, frozen: 0, retired: 0 }
  for (const entry of kitRoster.repos) {
    if (entry.role === 'infra') continue
    if (!(entry.status in byStatus)) failures.push(`family: ${KIT_ROSTER} entry ${entry.name} has status "${entry.status}"`)
    else byStatus[entry.status] += 1
  }
  if (kitRoster.repos.length !== rosterCount) {
    failures.push(
      `family: ${KIT_ROSTER} carries ${kitRoster.repos.length} entries but plugins.txt derives a roster of ${rosterCount} (${installCount} specs + ${RETIRED.roster.length} retired)`,
    )
  }
  if (pluginRepos !== rosterCount - infraEntries.length) {
    failures.push(
      `family: ${KIT_ROSTER} carries ${pluginRepos} non-infra entries but plugins.txt derives ${rosterCount} roster members of which ${infraEntries.length} is the infra entry`,
    )
  }
  const infraInSpecs = roster.filter((spec) => infraEntries.some((entry) => entry.name === repoOf(spec))).length
  const wantStatus = {
    active: counts.activeCount - infraInSpecs,
    frozen: counts.frozenCount,
    retired: RETIRED.roster.length,
  }
  if (byStatus.active !== wantStatus.active || byStatus.frozen !== wantStatus.frozen || byStatus.retired !== wantStatus.retired) {
    failures.push(
      `family: ${KIT_ROSTER} statuses are ${byStatus.active} active / ${byStatus.frozen} frozen / ${byStatus.retired} retired but plugins.txt derives ` +
        `${wantStatus.active} / ${wantStatus.frozen} / ${wantStatus.retired} over the same set (roster minus the ${infraInSpecs} infra entry)`,
    )
  }
}

// (a) dsh-catalog — data/packages.json is its single source of truth for the count,
//     and the shipped page must agree with it, Chinese fields included.
if (requireSibling('dsh-catalog/data/packages.json', 'the catalog row count')) {
  const packages = familyJson('dsh-catalog/data/packages.json')
  const catalogCount = packages.length
  const familyRows = packages.filter((pkg) => /^PerryLink\//.test(pkg.repo)).length
  const thirdParty = packages.filter((pkg) => !/^PerryLink\//.test(pkg.repo))
  if (kitRoster !== null && familyRows < kitRoster.repos.length) {
    failures.push(
      `family: dsh-catalog/data/packages.json catalogues only ${familyRows} PerryLink repositories; ${KIT_ROSTER} carries ${kitRoster.repos.length} — the catalog is missing family rows`,
    )
  }
  console.log(
    `check-parity: dsh-catalog — ${catalogCount} rows = ${familyRows} family + ${thirdParty.length} third-party (${thirdParty.map((p) => p.repo).join(', ') || 'none'})`,
  )
  if (requireSibling('dsh-catalog/deploy/catalog-source.json', "the catalog manifest's prose count")) {
    const text = familyRead('dsh-catalog/deploy/catalog-source.json')
    if (!new RegExp(`\\b${catalogCount}-package\\b`).test(text)) {
      failures.push(`family: dsh-catalog/deploy/catalog-source.json description does not state the derived ${catalogCount}-package count`)
    }
  }
  if (requireSibling('dsh-catalog/deploy/artifacts/v1/plugins.json', 'the shipped catalog page')) {
    const page = familyJson('dsh-catalog/deploy/artifacts/v1/plugins.json')
    if (page.items.length !== catalogCount || page.page.total !== catalogCount) {
      failures.push(
        `family: dsh-catalog ships ${page.items.length} items / page.total ${page.page.total} against ${catalogCount} rows in data/packages.json`,
      )
    }
    const noZh = page.items.filter((item) => !item.displayNameZh || !item.summaryZh)
    if (noZh.length > 0) {
      failures.push(
        `family: dsh-catalog ships ${noZh.length} of ${page.items.length} items without displayNameZh/summaryZh (e.g. ${noZh.slice(0, 3).map((i) => i.id).join(', ')}) — 53 of these are Chinese-audience compliance checkers`,
      )
    }
  }
}

// (b) dsh-plugin-certification — its README markers and the bold prose above them are
//     asserted by its own gate against the roster; re-derived here so a sibling gate
//     that was never run cannot hide a drifted number in the family's own docs.
if (requireSibling('dsh-plugin-certification/README.md', 'the certification registry prose') && kitRoster !== null) {
  const text = familyRead('dsh-plugin-certification/README.md')
  const pluginRepos = kitRoster.repos.filter((entry) => entry.role !== 'infra').length
  const certified = familyHas('dsh-plugin-certification/data/certified.json')
    ? familyJson('dsh-plugin-certification/data/certified.json').entries.length
    : null
  const marker = text.match(/<!--\s*roster-count:\s*(\d+)\s*-->/)
  if (!marker) failures.push('family: dsh-plugin-certification/README.md has no <!-- roster-count: N --> marker')
  else if (Number(marker[1]) !== pluginRepos) {
    failures.push(`family: dsh-plugin-certification/README.md says roster-count ${marker[1]} but ${KIT_ROSTER} derives ${pluginRepos}`)
  }
  if (certified === null) skips.push('dsh-plugin-certification/data/certified.json — the certified-count source')
  else {
    const marker2 = text.match(/<!--\s*certified-count:\s*(\d+)\s*-->/)
    if (!marker2) failures.push('family: dsh-plugin-certification/README.md has no <!-- certified-count: N --> marker')
    else if (Number(marker2[1]) !== certified) {
      failures.push(`family: dsh-plugin-certification/README.md says certified-count ${marker2[1]} but data/certified.json has ${certified}`)
    }
  }
}

// (c) dsh-plugin-portal — data/repos.json is a verbatim copy of the kit roster; its own
//     gate checks the sha256, this checks the membership the portal renders.
if (requireSibling('dsh-plugin-portal/data/repos.json', "the portal's roster copy") && kitRoster !== null) {
  const portal = familyJson('dsh-plugin-portal/data/repos.json')
  if (portal.repos.length !== kitRoster.repos.length) {
    failures.push(
      `family: dsh-plugin-portal/data/repos.json carries ${portal.repos.length} entries but ${KIT_ROSTER} carries ${kitRoster.repos.length} — re-copy the roster`,
    )
  }
}

// (d) @perrylink/dsh-plugin-doctor — data/verified-repos.json is the roster of family
//     members expected to carry a doctor badge, so every entry must be either a roster
//     repository or one of the two documented outsiders. A third unexplained entry is
//     how a badge roster silently grows a package nobody maintains.
const BADGE_ROSTER_EXCEPTIONS = {
  'dsh-plugin-upgrade-015': 'retired corridor leg: never in the kit roster, kept here so its badge resolves',
  'dsh-wechat': 'third-party bridge, hosted by pan17; counted as an exception rather than a family member',
}
if (requireSibling('dsh-plugin-doctor/data/verified-repos.json', "the doctor's badge roster")) {
  const verified = familyJson('dsh-plugin-doctor/data/verified-repos.json').repos
  const foreign = verified.filter((entry) => !/^PerryLink\//.test(entry.repo ?? ''))
  if (foreign.length > 0) {
    failures.push(`family: dsh-plugin-doctor/data/verified-repos.json lists non-family repositories: ${foreign.map((e) => e.repo).join(', ')}`)
  }
  if (kitRoster !== null) {
    const names = new Set(kitRoster.repos.map((entry) => entry.name))
    const unknown = verified
      .map((entry) => (entry.repo ?? '').split('/')[1])
      .filter((name) => !names.has(name) && !(name in BADGE_ROSTER_EXCEPTIONS))
    if (unknown.length > 0) {
      failures.push(
        `family: dsh-plugin-doctor/data/verified-repos.json lists repositories absent from ${KIT_ROSTER} and not documented as exceptions: ${unknown.join(', ')}`,
      )
    }
  }
  console.log(
    `check-parity: dsh-plugin-doctor — ${verified.length} badge-roster entries, all PerryLink-owned, ` +
      `${Object.keys(BADGE_ROSTER_EXCEPTIONS).length} documented exceptions outside the kit roster`,
  )
}

// (e) every sibling README's family blurb must state one of the two documented scopes.
//     Anything else is a third, undocumented count — which is exactly how the family
//     ended up with "33 active / 6 frozen" in three READMEs while plugins.txt said 34
//     and 5, and with 45 rows under a sentence that said the roster was 42.
//
//     ⚠️ Read the DEFAULT BRANCH, not whatever the working copy happens to be on. Five
//     family checkouts sit on a side branch and their README is not the published one:
//     dsh-claude-move's local `kb-crosslink` README carries a 47-row table with no
//     status column at all, while `origin/main` carries the correct 44-row table. The
//     family's own rule is "judge status by the default branch"; this gate applies it
//     rather than trusting the tree it was pointed at.
const TABLE_HEADER = /^\| Plugin \|(?: One-liner \|)? Status \|\s*$/m
const BLURBS = [
  {
    name: 'full family blurb',
    re: /one of the \*\*(\d+) actively maintained\*\*[^\n]*?the roster is \*\*(\d+)\*\*, of which \*\*(\d+)\*\* are frozen and \*\*(\d+)\*\* retired/,
    keys: ['active', 'roster', 'frozen', 'retired'],
  },
  { name: 'short family blurb', re: /one of the \[(\d+) DeepSeek Harness plugins\]/, keys: ['roster'] },
]
const markedFrozen = new Set(frozen.map(repoOf))
const markedRetired = new Set([...RETIRED.roster, ...RETIRED.corridor])

/** All family-table problems in one README's text. Pure: takes the text, returns strings. */
const familyProblems = (rel, text) => {
  const problems = []
  const start = text.search(TABLE_HEADER)
  if (start < 0) return [`family: ${rel} carries no recognized family table`]
  const rest = text.slice(start)
  const end = rest.slice(1).search(/^## /m)
  const section = end === -1 ? rest : rest.slice(0, end + 1)
  const headerCells = section.match(TABLE_HEADER)[0].split('|').length - 2
  for (const [, rowName, , tail] of section.matchAll(/^\| \*\*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\*\* \|(.*)$/gm)) {
    const cells = tail.replace(/\|\s*$/, '').split('|').map((cell) => cell.trim())
    if (cells.length + 1 !== headerCells) {
      problems.push(`family: ${rel} row ${rowName} has ${cells.length + 1} cells against a ${headerCells}-cell header`)
    }
    const status = cells[cells.length - 1] ?? ''
    const shouldBeMarked = markedFrozen.has(rowName) || markedRetired.has(rowName)
    if (shouldBeMarked && status === '') problems.push(`family: ${rel} row ${rowName} is frozen or retired but carries no status`)
    if (!shouldBeMarked && status !== '') problems.push(`family: ${rel} row ${rowName} is active but carries the status "${status}"`)
  }
  return problems
}

/** The branch of a sibling's local checkout and the branch its origin calls default. */
const branchesOf = (name) => {
  const dir = join(familyRoot, name)
  if (!existsSync(join(dir, '.git'))) return null
  const current = spawnSync('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' })
  if (current.status !== 0) return null
  const head = spawnSync('git', ['-C', dir, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], { encoding: 'utf8' })
  const fallback = spawnSync('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'origin/HEAD'], { encoding: 'utf8' })
  const raw = (head.status === 0 ? head.stdout : fallback.stdout) ?? ''
  const def = raw.trim().replace(/^origin\//, '')
  return { current: current.stdout.trim(), default: def || null }
}

if (familyRoot !== root && existsSync(familyRoot)) {
  const readmeDirs = readdirSync(familyRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(familyRoot, name, 'README.md')))
  let blurbsSeen = 0
  let tablesSeen = 0
  let offDefault = 0
  for (const name of readmeDirs) {
    const rel = `${name}/README.md`
    const text = familyRead(rel)
    if (!TABLE_HEADER.test(text)) continue
    tablesSeen += 1
    let problems = familyProblems(rel, text)
    if (problems.length > 0) {
      const branches = branchesOf(name)
      if (branches !== null && branches.default !== null && branches.current !== branches.default) {
        // `origin/<default>`, not the local ref of the same name: dsh-claude-move's local
        // `main` is 5 commits behind `origin/main` and still carries the pre-unfreeze
        // 33/42/6/3 blurb, so reading the local name would report a drift that the
        // published branch does not have.
        const remote = `refs/remotes/origin/${branches.default}`
        let shown = spawnSync('git', ['-C', join(familyRoot, name), 'show', `${remote}:README.md`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
        if (shown.status !== 0) {
          shown = spawnSync('git', ['-C', join(familyRoot, name), 'show', `${branches.default}:README.md`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
        }
        const published = shown.status === 0 ? shown.stdout : null
        const publishedProblems = published === null ? null : familyProblems(rel, published)
        if (publishedProblems !== null && publishedProblems.length === 0) {
          offDefault += 1
          skips.push(
            `${rel} — the local checkout is on "${branches.current}", not the default "${branches.default}"; origin/${branches.default}'s copy passes, so this is a stale working tree rather than a drifted published number`,
          )
          blurbsSeen += 1
          continue
        }
        if (publishedProblems !== null && publishedProblems.length > 0) {
          problems = publishedProblems.map((p) => `${p} [read from origin/${branches.default}]`)
        }
      }
    } else {
      blurbsSeen += 1
    }
    failures.push(...problems)
  }
  if (tablesSeen === 0) skips.push(`no family table found under ${familyRoot} — sibling READMEs are not checked out`)
  else {
    console.log(
      `check-parity: checked ${tablesSeen} sibling family tables (${blurbsSeen} with a documented blurb` +
        `${offDefault > 0 ? `, ${offDefault} judged on the default branch because the working tree is on a side branch` : ''})`,
    )
  }
} else {
  skips.push(`${familyRoot} — the sibling family checkout (checked README blurbs, catalog, certification, portal and doctor counts)`)
  if (requireFamily) failures.push(`family: --require-family was passed but the sibling root ${familyRoot} does not exist`)
}

if (failures.length > 0) {
  console.error(`check-parity: FAIL (${failures.length})`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
for (const note of skips) console.log(`check-parity: SKIP ${note}`)
console.log(
  `check-parity: ok — plugins.txt has ${installCount} specs ` +
    `(${activeCount} active + ${frozenCount} frozen, roster ${rosterCount}, ${RETIRED_SPECS.length} retired excluded), ` +
    `both installers read it and strip the status comment, README.md states ${activeCount}/${frozenCount}/${installCount}/${rosterCount} in 5 places, ` +
    `and the family table carries ${tableRows.length} PerryLink repositories, every row ${headerCells} cells wide with the right status`,
)
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({
    install: installCount,
    active: activeCount,
    frozen: frozenCount,
    roster: rosterCount,
    familyRows: tableRows.length,
    default: SCOPES.default,
    full: SCOPES.full,
  }, null, 2))
}
console.log(
  `check-parity: documented scopes — default ${SCOPES.default.active}/${SCOPES.default.roster}/${SCOPES.default.frozen}/${SCOPES.default.retired}, ` +
    `full ${SCOPES.full.active}/${SCOPES.full.roster}/${SCOPES.full.frozen}/${SCOPES.full.retired} (active/roster/frozen/retired)`,
)
