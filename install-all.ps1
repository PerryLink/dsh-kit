# install-all.ps1 — install the PerryLink DSH plugins listed in plugins.txt.
# Usage: .\install-all.ps1 [-Profile web] [-IncludeCheckers]
#
# The roster is plugins.txt next to this script. Do not inline a package list
# here: scripts/check-parity.mjs fails when either installer hard-codes one, and
# holds README.md's counts to the same file.
#
# Retired packages are not in plugins.txt, so this never installs them. Frozen
# packages are, and are installed — a trailing "# ..." comment on their line
# marks them; it is stripped here and counted for the summary below.
#
# Lines marked `# opt-in` are skipped unless -IncludeCheckers is passed. The 53
# compliance checkers are marked that way: they are roster plugins and the counts
# include them, but a starter pack that silently installs 92 packages is not a
# starter pack.
param(
  [string]$Profile = "web",
  [switch]$IncludeCheckers
)

$rosterPath = Join-Path $PSScriptRoot 'plugins.txt'
if (-not (Test-Path $rosterPath)) {
  Write-Error "plugins.txt not found next to this script: $rosterPath"
  exit 1
}

$lines = Get-Content -LiteralPath $rosterPath
$plugins = $lines |
  Where-Object { $IncludeCheckers -or $_ -notmatch '#\s*opt-in' } |
  ForEach-Object { ($_ -replace '#.*$', '').Trim() } |
  Where-Object { $_ }
$frozen = @($lines | Where-Object { $_ -match 'FROZEN' }).Count
$skipped = @($lines | Where-Object { $_ -match '#\s*opt-in' }).Count

$failed = @()
foreach ($p in $plugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}

if ($failed.Count -eq 0) {
  Write-Host "All $($plugins.Count) plugins installed into profile '$Profile' ($frozen of them frozen — see plugins.txt)." -ForegroundColor Green
  if (-not $IncludeCheckers -and $skipped -gt 0) {
    Write-Host "$skipped opt-in plugins were skipped; add -IncludeCheckers to install them too (see plugins.txt)." -ForegroundColor DarkGray
  }
} else {
  Write-Host "These plugins failed, install them manually: $($failed -join ', ')" -ForegroundColor Yellow
}
