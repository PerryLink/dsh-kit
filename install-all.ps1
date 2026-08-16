# install-all.ps1 — install the 15 PerryLink DSH plugins into one profile.
# Usage: .\install-all.ps1 [-Profile web]
param(
  [string]$Profile = "web"
)

$npmPlugins = @(
  'dsh-checkpoint-rewind',
  'dsh-permission-rules',
  'dsh-output-styles',
  'dsh-memento',
  'dsh-background-agents',
  'dsh-doublecheck',
  'dsh-auto-review',
  'dsh-mcp-panel',
  'dsh-lsp-actions',
  'dsh-github' -replace 'dsh-github', '@perrylink/dsh-github',
  'dsh-skill-pack-security' -replace 'dsh-skill-pack-security', '@perrylink/dsh-skill-pack-security-provider',
  'dsh-session-pin',
  'dsh-composer-history'
)

$gitPlugins = @(
  'github:PerryLink/dsh-plugin-guide',
  'github:PerryLink/dsh-claude-move'
)

$failed = @()
foreach ($p in $npmPlugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}
foreach ($p in $gitPlugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}

if ($failed.Count -eq 0) {
  Write-Host "All 15 plugins installed into profile '$Profile'." -ForegroundColor Green
} else {
  Write-Host "These failed, install them manually: $($failed -join ', ')" -ForegroundColor Yellow
}
