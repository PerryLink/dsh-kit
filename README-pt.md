<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-hero-en-dark.webp">
  <img src="docs/assets/dsh-kit-hero-en-light.webp" width="100%" alt="dsh-kit: instalador de um comando para a família — plugins.txt tem 96 specs (88 active + 8 frozen), o roster são 99 repositórios com 6 aposentados excluídos, ambos os instaladores leem a mesma lista e node scripts/check-parity.mjs fixa README 88/8/96/99 e 9 tabelas da família nela">
</picture>

# dsh-kit

Instalador de um comando e roster principal da família de plugins PerryLink DeepSeek Harness: plugins.txt é a única lista, ambos os instaladores a leem, o frozen instala e o aposentado não.

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

</div>

> Este arquivo é a entrada localizada em português; o corpo técnico completo está no [README.md](README.md) em inglês e não é repetido aqui.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-flow-v5-dark.svg">
  <img src="docs/assets/dsh-kit-flow-v5-light.svg" width="100%" alt="Diagrama de estrutura do dsh-kit: family.txt (117 specs de instalação) e data/repos.json (99 repositórios PerryLink) alimentam plugins.txt; install-all.sh e install-all.ps1 leem esse roster e chamam dsh plugin add; node scripts/check-parity.mjs verifica 9 tabelas da família, os números do README 88/8/96/99 e ambos os instaladores, enquanto npm run build:market grava market/index.json no formato 1 do DSH plugin-market">
</picture>

*Estrutura: family.txt + data/repos.json → plugins.txt → install-all → dsh plugin add → portão. Os rótulos do diagrama são nomes reais de arquivo, script e comando, então uma única imagem serve aos cinco idiomas.*

## Início rápido

![dsh-kit: execução real de node scripts/check-parity.mjs --json — install 96, active 88, frozen 8, roster 99, familyRows 99, escopo default 35/46/8/3 e escopo full 88/99/8/3 (active/roster/frozen/retired)](docs/assets/dsh-kit-demo.gif)

*Animação: node scripts/check-parity.mjs --json reexecutado em 2026-11-21 — as contagens que o portão deriva de plugins.txt (stdout real; as linhas de resumo humano são impressas antes deste JSON).*

Escolha um perfil (por exemplo `web`) e rode `./install-all.sh web` (no Windows, `.\install-all.ps1 -Profile web`) para instalar tudo; também dá para instalar avulsos com `dsh plugin --profile web add <spec>`, como `dsh-checkpoint-rewind`, `dsh-permission-rules` ou `dsh-output-styles`. Os comandos completos estão na seção Quick start do README em inglês.

## O que vem dentro (os instaladores cobrem 43 specs npm mais 53 opcionais, 96 no total)

Os destaques ficam em quatro grupos: o trio equivalente ao Claude Code, memória/agentes/fluxo de trabalho, ferramentas de desenvolvimento e segurança, e UX/migração (as quatro subseções do README em inglês); dois estão aposentados e um congelado, mas continuam instaláveis. A lista completa é o `plugins.txt`.

## Notas

`plugins.txt` é a única lista: os aposentados não entram, os congelados levam o comentário `# 🧊 FROZEN` mas são instalados; os instaladores são idempotentes; `scripts/npm-downloads-snapshot.mjs` registra os downloads mensais; as versões seguem o npm e podem ser fixadas por plugin quando você precisa de reprodutibilidade.

## Índice pessoal de plugins

`market/index.json` é um índice DSH plugin-market format 1 gerado a partir deste roster, só com pacotes PerryLink, publicado em `https://perrylink.github.io/dsh-kit/index.json`; regenere com `npm run build:market` e valide offline com `npm run check:market`.

## Feedback

Abra issues e pedidos no repositório do plugin correspondente, ou discuta a família inteira nas DeepSeek Harness Discussions oficiais (categoria “Show Your Plugins!”).

## Família de plugins PerryLink DSH

Este repositório faz parte da família de plugins do DeepSeek Harness da [PerryLink](https://github.com/PerryLink); as três camadas e a linha Phocinae estão em [FAMILY.md](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md) e o roster completo no [README.md](README.md) em inglês.

## Fora do roster de instalação

Duas superfícies são apenas de catálogo: `dsh-translate` 0.3.2 e a suíte de pesquisa de 19 pacotes; são instaladas por nome e não estão em `plugins.txt` / `family.txt`, então o `install-all` não as instala.

## Cobertura de compatibilidade

`dsh-hcb` 0.12.0 registra 143 linhas (136 checked + 7 tested) sobre o roster de 112 pacotes da família mais 31 plugins externos; o checker marca 143/143 linhas em `dsh-standards@1.7.0`. O detalhe está na seção Compatibility coverage do README em inglês.

[Privacy](PRIVACY.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)
