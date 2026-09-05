// check-parity.mjs — the two installers must install the same plugin set.
// Extracts the final plugin spec of every entry from install-all.ps1 and
// install-all.sh and fails when the sets differ or the count is not 37.

import { readFileSync } from 'node:fs'

const ps1 = readFileSync('install-all.ps1', 'utf8')
const sh = readFileSync('install-all.sh', 'utf8')

// install-all.ps1: entries are either `'spec',` or `'alias' -replace 'alias', 'spec',`.
const ps1Entry = /^\s*'([^']+)'(?:\s+-replace\s+'[^']+',\s*'([^']+)')?,?\s*$/gm
const ps1Set = new Set()
for (const match of ps1.matchAll(ps1Entry)) {
  ps1Set.add(match[2] ?? match[1])
}

// install-all.sh: entries are bare lines inside the two list blocks.
const shEntry = /^\s*(dsh-[a-z-]+|@perrylink\/dsh-[a-z-]+|github:PerryLink\/dsh-[a-z-]+)\s*$/gm
const shSet = new Set()
for (const match of sh.matchAll(shEntry)) {
  shSet.add(match[1])
}

const missingInSh = [...ps1Set].filter((name) => !shSet.has(name))
const missingInPs1 = [...shSet].filter((name) => !ps1Set.has(name))
const failures = []
if (missingInSh.length > 0) failures.push(`in install-all.ps1 but not install-all.sh: ${missingInSh.join(', ')}`)
if (missingInPs1.length > 0) failures.push(`in install-all.sh but not install-all.ps1: ${missingInPs1.join(', ')}`)
if (shSet.size !== 37 || ps1Set.size !== 37) failures.push(`expected 37 plugins, got ${ps1Set.size} (ps1) / ${shSet.size} (sh)`)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`parity OK: both installers list the same ${shSet.size} plugins`)
