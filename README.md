# dsh-kit

[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-kit/ci.yml?branch=main)](https://github.com/PerryLink/dsh-kit/actions)

**One-command starter pack: install all 15 PerryLink DeepSeek Harness plugins.**

[dsh-kit](https://github.com/PerryLink/dsh-kit) is a curated collection of [PerryLink's DSH plugin family](https://github.com/PerryLink) — the Claude Code parity trio plus twelve more plugins that cover memory, MCP observability, background agents, engineering discipline, security and migration. Each plugin ships with a complete `dsh.bundle` manifest, five-language docs, CI, and npm publishing.

## Quick start

Pick a profile (e.g. `web`), then install everything:

```sh
# Linux / macOS
./install-all.sh web

# Windows PowerShell
.\install-all.ps1 -Profile web
```

Or install individual plugins:

```sh
dsh plugin --profile web add dsh-checkpoint-rewind   # /rewind equivalent
dsh plugin --profile web add dsh-permission-rules    # allow/deny/ask rules
dsh plugin --profile web add dsh-output-styles       # outputStyles equivalent
```

## What's inside

### The Claude Code parity trio

| Plugin | One-liner |
|---|---|
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Git-first snapshots before every mutation, session forks, one-shot `/rewind` restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Declarative allow/deny/ask permission rules with audit, dry-run and hot reload |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Runtime-switchable model output styles with per-session persistence |

### Memory, agents & workflow

| Plugin | One-liner |
|---|---|
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: `ctx.memory` + SQLite + `memory` tool |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents: sidebar progress, messaging, interrupt |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed |

### Developer & safety tools

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: `/mcp` + Settings tab |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions, rename |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issue integration; every write gated by human approval |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | Security-audit skill pack: secret scan, dependency and supply-chain review |

### UX & migration

| Plugin | One-liner |
|---|---|
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | Terminal-style input history for the web composer: arrows, Ctrl+R |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |

## Notes

- Install scripts are **idempotent** — safe to re-run.
- `dsh-plugin-guide` and `dsh-claude-move` install from GitHub (they are not published to npm); everything else installs from npm.
- Versions track the latest npm releases; pin a specific version per plugin if you need reproducibility.
- License: Apache-2.0 (matching the plugin family).

## Feedback

Issues and feature requests: open them on the individual plugin repo, or discuss the whole family on the [official DeepSeek Harness Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) (category "Show Your Plugins!").
