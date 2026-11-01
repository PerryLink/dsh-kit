# install-family.ps1 — install every installable family package (117).
# Usage: .\install-family.ps1 [-Profile web]
#
# Reads family.txt, generated from dsh-plugins/family.json. Excludes the two
# domain suites, 3 retired packages and 3 support repositories.
param([string]$Profile = "web")

$rosterPath = Join-Path $PSScriptRoot 'family.txt'
if (-not (Test-Path $rosterPath)) {
  Write-Error "family.txt not found next to this script: $rosterPath"
  exit 1
}
$plugins = Get-Content -LiteralPath $rosterPath |
  ForEach-Object { ($_ -replace '#.*$', '').Trim() } |
  Where-Object { $_ }
$failed = @()
foreach ($p in $plugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}
if ($failed.Count -eq 0) {
  Write-Host "All $($plugins.Count) family packages installed into profile '$Profile'." -ForegroundColor Green
} else {
  Write-Host "These failed, install them manually: $($failed -join ', ')" -ForegroundColor Yellow
  exit 1
}
