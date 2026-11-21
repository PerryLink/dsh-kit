<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-hero-zh-dark.webp">
  <img src="docs/assets/dsh-kit-hero-zh-light.webp" width="100%" alt="dsh-kit：家族的一条命令安装器 —— plugins.txt 记录 96 个 spec（88 active + 8 frozen），名册共 99 个仓库、6 个退役包被排除；两种安装器读同一份名单，node scripts/check-parity.mjs 把 README 的 88/8/96/99 与 9 张兄弟家族表钉在名单上">
</picture>

# dsh-kit

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

</div>

[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-kit?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-kit?ref=badge)

[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-kit/ci.yml?branch=main)](https://github.com/PerryLink/dsh-kit/actions)
[![npm](https://img.shields.io/npm/v/dsh-kit)](https://www.npmjs.com/package/dsh-kit)

**为积极维护的 PerryLink DeepSeek Harness 插件准备的一条命令安装包，同时把冻结插件保留为可安装。**

[dsh-kit](https://github.com/PerryLink/dsh-kit) 是 [PerryLink 全家桶 DSH 插件家族](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md) 的安装器与主线名册——三级标准与检查、指南、开发者工具链、运行时插件、53 项检查器的合规套件、领域运营、目录，以及独立的 Phocinae 决策线。每个插件都带完整的 `dsh.bundle` manifest、五语文档、CI 与 npm 发布。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-flow-v5-dark.svg">
  <img src="docs/assets/dsh-kit-flow-v5-light.svg" width="100%" alt="dsh-kit 结构图：family.txt（117 个安装 spec）与 data/repos.json（99 个 PerryLink 仓库）汇成 plugins.txt；install-all.sh 与 install-all.ps1 读取名册并调用 dsh plugin add；node scripts/check-parity.mjs 门禁 9 张兄弟家族表、README 的 88/8/96/99 与两种安装器，npm run build:market 写出 DSH plugin-market format 1 的 market/index.json">
</picture>

*结构：family.txt + data/repos.json → plugins.txt → install-all → dsh plugin add → 门禁。图中的标注都是真实文件名、脚本名与命令，因此一张图能服务全部五种语言。*


## 快速开始

![dsh-kit 真实终端运行 node scripts/check-parity.mjs --json：install 96、active 88、frozen 8、roster 99、familyRows 99，default 作用域 35/46/8/3、full 作用域 88/99/8/3（active/roster/frozen/retired）](docs/assets/dsh-kit-demo.gif)

*动图：node scripts/check-parity.mjs --json 于 2026-11-21 的复跑——门禁从 plugins.txt 派生出的名册计数（真实 stdout；人读摘要行印在这段 JSON 之前）。*

选一个 profile（例如 `web`），然后安装全部：

```sh
# Linux / macOS
./install-all.sh web

# Windows PowerShell
.\install-all.ps1 -Profile web
```

或单独安装插件：

```sh
dsh plugin --profile web add dsh-checkpoint-rewind   # /rewind equivalent
dsh plugin --profile web add dsh-permission-rules    # allow/deny/ask rules
dsh plugin --profile web add dsh-output-styles       # outputStyles equivalent
```

## 内容一览（精选亮点——安装器覆盖 43 个 npm spec，外加 53 个可选（共 96 个））

下面亮点中有两个是**退役**、一个是**冻结**。它们仍被列出、仍可安装，因为已经有人在用：🧊 **FROZEN** 意味着不再新增功能、只修真正的故障，🚫 **RETIRED** 意味着宿主现在已原生实现该功能、包已在 npm 上弃用——退役包**不在** `plugins.txt` 中，因此全新安装永远不会把它们拉进来。

### Claude Code 对齐三件套

| 插件 | 一句话简介 |
|---|---|
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | 每次变更前先做 Git 优先的快照，支持会话分叉、一键 `/rewind` 恢复 |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | 声明式 allow/deny/ask 权限规则，带审计、dry-run 与热重载 |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | 运行时可切换的模型输出风格，按会话持久化 |

### 记忆、agent 与工作流

| 插件 | 一句话简介 | 状态 |
|---|---|---|
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | 经审批门禁的跨会话记忆：`ctx.memory` + SQLite + `memory` 工具 | |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | 持久的后台子 agent：侧栏进度、消息传递、中断 | 🚫 **RETIRED** —— 宿主已内置原生可续接子 agent |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | 工程纪律守卫：需求质询、测试门禁、对抗式评审 | |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | 审批链上的第二模型自动审查，fail-closed | |

### 开发者与安全工具

| 插件 | 一句话简介 |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | 只读 MCP 运行时面板：`/mcp` + 设置页签 |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP 诊断、格式化、补全、代码操作、重命名 |
| [dsh-github-bot](https://github.com/PerryLink/dsh-github-bot) | GitHub PR/issue 集成；每次写入都需人工审批 |
| [dsh-security-pack](https://github.com/PerryLink/dsh-security-pack) | 安全审计技能包：密钥扫描、依赖与供应链审查 |

### 体验与迁移

| 插件 | 一句话简介 | 状态 |
|---|---|---|
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | 在 Web 侧栏固定会话，并保持持久排序 | 🚫 **RETIRED** —— 宿主已原生提供会话固定 |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | Web 输入框的终端式输入历史：方向键、Ctrl+R | |
| [dsh-primer](https://github.com/PerryLink/dsh-primer) | 作为按需 agent 技能的插件开发知识库 | |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | 把 Claude Code 的会话、记忆、技能与 CLAUDE.md 迁移进 DSH | 🧊 FROZEN — 见仓库 README |

## 说明

- 被安装的集合是 [`plugins.txt`](plugins.txt)——每行一个 npm spec，也是名册唯一被写下的地方。两个安装器都读它，`node scripts/check-parity.mjs` 把它们与页面上每一个计数都锁到它。
- **退役包不在 `plugins.txt` 中**，因此全新安装永远不会拉入它们；若有人把它们加回去，门禁会失败。五个退役名称及其原因列在该文件自身的头部注释里。
- **冻结包在 `plugins.txt` 中**且会被安装；其行尾的 `# 🧊 FROZEN` 注释用于标记，两个安装器在调用 `dsh plugin add` 前都会剥掉该注释。
- 安装脚本是**幂等**的——可以安全地重复运行。
- `dsh-security-pack` 从 npm 安装。
- 版本跟随最新的 npm 发布；如果需要可复现性，请按插件锁定具体版本。
- **每月下载基线：** `node scripts/npm-downloads-snapshot.mjs` 读取本文件自身的名册，把每个 spec 的周、月 npm 下载量追加到 `data/npm-downloads-snapshots.json`，这样分发变化可以与上个月对比衡量，而不是凭空断言。它只写这一条序列——profile 页面的下载数字保持原处。参见 `scripts/npm-downloads-snapshot.mjs`。
- 已弃用名称不会被安装：`dsh-background-agents`、`dsh-session-pin` 与 `dsh-team-rooms`（宿主现已原生实现这三者），以及 `dsh-plugin-upgrade-015` 及其更早名称 `dsh-plugin-upgrade-rc1`（已被 `dsh-codemod` 取代，后者把每条走廊都装进一个包）。它们仍留在 npm 上，供已经安装过的人使用。
- 许可证：Apache-2.0（与插件家族一致）。

## 个人插件索引

[`market/index.json`](market/index.json) 是由本名册生成的 [DSH plugin-market format 1](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.md) 索引。它只列出 PerryLink 的包，发布在 `https://perrylink.github.io/dsh-kit/index.json`；在 DSH 的 **Plugins → Discover → Add index source** 下添加它。它独立于任何官方或社区市场，也不替代安装器。

```sh
npm ci
npm run build:market   # regenerate from plugins.txt + family.txt (reads npm)
npm run check:market   # offline format/coverage checks
npm run test:market    # offline generator fixtures
```

客户端支持（包括 dsh-Go/dsh-TUI 的限制）、denylist 与展示 overlay 见 [`market/README.md`](market/README.md)。

## 反馈

问题与功能请求：在对应的插件仓库里提，或者在[官方 DeepSeek Harness Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 上讨论整个家族（类别 “Show Your Plugins!”）。


## PerryLink DSH 插件家族

本项目是 [PerryLink](https://github.com/PerryLink) 的 DeepSeek Harness 插件家族的一部分。家族分三层——标准/指南、开发者工具链、运行时/领域插件——外加 Phocinae 决策线；逐组完整索引见 [FAMILY.md](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md)。安装名册默认折叠在下方，让每份 README 都保持简短首屏；展开即可看到每一行及其状态。

<details>
<summary>展开全部插件</summary>

| 插件 | 状态 |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-community-bench](https://github.com/PerryLink/dsh-community-bench)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github-bot](https://github.com/PerryLink/dsh-github-bot)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-clinic](https://github.com/PerryLink/dsh-clinic)** |  |
| **[dsh-primer](https://github.com/PerryLink/dsh-primer)** |  |
| **[dsh-scaffold](https://github.com/PerryLink/dsh-scaffold)** |  |
| **[dsh-codemod](https://github.com/PerryLink/dsh-codemod)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-security-pack](https://github.com/PerryLink/dsh-security-pack)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-dida](https://github.com/PerryLink/dsh-dida)** |  |
| **[dsh-param-repair](https://github.com/PerryLink/dsh-param-repair)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** |  |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** |  |
| **[dsh-plugin-portal](https://github.com/PerryLink/dsh-plugin-portal)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 FROZEN — 见仓库 README |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 RETIRED — 见仓库 README |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 RETIRED — 见仓库 README |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 RETIRED — 见仓库 README |

</details>

## 不在安装名册中

有两个表面仅存在于目录中，按名称安装，并刻意不在 `plugins.txt` / `family.txt` 中（因此 `install-all` 不会安装它们）：

- **`dsh-translate` 0.3.2** —— 在你自己的模型路由上做整页 Web GUI 翻译；代码、路径、命令、标识符与产品名保持原样。`dsh plugin --profile <name> add dsh-translate`。
- **19 包的研究套件** —— 引用、断言、数据集、基金、稿件、元分析与可复现性工具；见 [FAMILY.md §10](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md#10-research-suite-catalog-only-19)。


## 兼容性覆盖

[HCB](https://github.com/PerryLink/dsh-hcb) 0.12.0 记录 **143 行——136 项已检查 + 7 项已实测**——即完整的 112 包家族名册（34 个主线默认 + 53 个可选 + 10 个仅目录 + 15 个领域）加上 31 个外部插件——并记录 **3 条 FLOW `manual`** 与 **gate 2 受阻 · 31 条 review · 109 条 pilot · 1 条 `production-candidate`**（`dsh-plugin-guide@0.5.9` 是唯一的 PC；另有六行已实测：`dsh-budget@0.4.26`、`dsh-defend@0.3.28`、`dsh-mask@0.2.25`、`dsh-memento@0.5.31`、`dsh-observe@0.2.28`、`dsh-test-drive@0.3.26`；其余 136 行未实测），检查器**在 `dsh-standards@1.7.0` 上 143/143 行通过**。CI 可以调用 `PerryLink/dsh-hcb-action@main`。
