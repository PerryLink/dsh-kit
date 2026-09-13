# install-all.ps1 — install the 37 PerryLink DSH plugins into one profile.
# Usage: .\install-all.ps1 [-Profile web]
param(
  [string]$Profile = "web"
)

$plugins = @(
  'dsh-auto-review',
  'dsh-background-agents',
  'dsh-budget',
  'dsh-checkpoint-rewind',
  'dsh-claude-move',
  'dsh-click',
  'dsh-composer-history',
  'dsh-data-quality',
  'dsh-defend',
  'dsh-doublecheck',
  'dsh-draw',
  'dsh-fast',
  'dsh-fund-research',
  'dsh-industry-research',
  'dsh-library',
  'dsh-local-ai',
  'dsh-lsp-actions',
  'dsh-mask',
  'dsh-mcp-panel',
  'dsh-memento',
  'dsh-observe',
  'dsh-output-styles',
  'dsh-permission-rules',
  'dsh-plugin-guide',
  'dsh-reach',
  'dsh-research-report',
  'dsh-score',
  'dsh-session-pin',
  'dsh-session-sync',
  'dsh-talk',
  'dsh-test-drive',
  'dsh-translate',
  'dsh-wechat',
  '@perrylink/dsh-github',
  '@perrylink/dsh-skill-pack-security-provider',
  '@perrylink/dsh-ticktick'
)

$failed = @()
foreach ($p in $plugins) {
  Write-Host "== installing $p ==" -ForegroundColor Cyan
  dsh plugin --profile $Profile add $p
  if ($LASTEXITCODE -ne 0) { $failed += $p }
}

if ($failed.Count -eq 0) {
  Write-Host "All 37 plugins installed into profile '$Profile'." -ForegroundColor Green
} else {
  Write-Host "These failed, install them manually: $($failed -join ', ')" -ForegroundColor Yellow
}
