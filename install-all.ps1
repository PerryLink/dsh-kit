# install-all.ps1 — install every PerryLink DSH plugin listed in plugins.txt.
# Usage: .\install-all.ps1 [-Profile web]
#
# The roster is plugins.txt next to this script. Do not inline a package list
# here: scripts/check-parity.mjs fails when either installer hard-codes one, and
# holds README.md's counts to the same file.
param(
  [string]$Profile = "web"
)

$rosterPath = Join-Path $PSScriptRoot 'plugins.txt'
if (-not (Test-Path $rosterPath)) {
  Write-Error "plugins.txt not found next to this script: $rosterPath"
  exit 1
}

$plugins = Get-Content -LiteralPath $rosterPath |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -and -not $_.StartsWith('#') }

$failed = @()
foreach ($p in $plugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}

if ($failed.Count -eq 0) {
  Write-Host "All $($plugins.Count) plugins installed into profile '$Profile'." -ForegroundColor Green
} else {
  Write-Host "These failed, install them manually: $($failed -join ', ')" -ForegroundColor Yellow
}
