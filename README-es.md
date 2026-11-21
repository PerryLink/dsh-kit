<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-hero-en-dark.webp">
  <img src="docs/assets/dsh-kit-hero-en-light.webp" width="100%" alt="dsh-kit: instalador de un comando para la familia — plugins.txt tiene 96 specs (88 active + 8 frozen), el roster son 99 repositorios con 6 retirados excluidos, ambos instaladores leen la misma lista y node scripts/check-parity.mjs fija README 88/8/96/99 y 9 tablas familiares a ella">
</picture>

# dsh-kit

Instalador de un comando y roster principal de la familia de plugins PerryLink DeepSeek Harness: plugins.txt es la única lista, ambos instaladores la leen, lo frozen se instala y lo retirado no.

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

</div>

> Este archivo es la entrada localizada en español; el cuerpo técnico completo vive en el [README.md](README.md) en inglés y no se repite aquí.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-flow-v5-dark.svg">
  <img src="docs/assets/dsh-kit-flow-v5-light.svg" width="100%" alt="Diagrama de estructura de dsh-kit: family.txt (117 specs de instalación) y data/repos.json (99 repositorios PerryLink) alimentan plugins.txt; install-all.sh e install-all.ps1 leen ese roster y llaman a dsh plugin add; node scripts/check-parity.mjs verifica 9 tablas familiares, los números del README 88/8/96/99 y ambos instaladores, mientras npm run build:market escribe market/index.json en formato 1 de DSH plugin-market">
</picture>

*Estructura: family.txt + data/repos.json → plugins.txt → install-all → dsh plugin add → puerta. Las etiquetas del diagrama son nombres de archivo, scripts y comandos reales, por eso una sola imagen sirve a los cinco idiomas.*

## Inicio rápido

![dsh-kit: ejecución real de node scripts/check-parity.mjs --json — install 96, active 88, frozen 8, roster 99, familyRows 99, ámbito default 35/46/8/3 y ámbito full 88/99/8/3 (active/roster/frozen/retired)](docs/assets/dsh-kit-demo.gif)

*Animación: node scripts/check-parity.mjs --json re-ejecutado el 2026-11-21 — los recuentos que la puerta deriva de plugins.txt (stdout real; las líneas de resumen se imprimen antes de este JSON).*

Elige un perfil (por ejemplo `web`) y ejecuta `./install-all.sh web` (en Windows, `.\install-all.ps1 -Profile web`) para instalar todo; también puedes instalar sueltos con `dsh plugin --profile web add <spec>`, por ejemplo `dsh-checkpoint-rewind`, `dsh-permission-rules` o `dsh-output-styles`. Los comandos completos están en la sección Quick start del README en inglés.

## Qué incluye (los instaladores cubren 43 specs npm más 53 opcionales, 96 en total)

Los destacados se agrupan en el trío equivalente a Claude Code, memoria/agentes/flujo de trabajo, herramientas de desarrollo y seguridad, y UX/migración (las cuatro subsecciones del README en inglés); dos están retirados y uno congelado, pero siguen instalables. La lista completa es `plugins.txt`.

## Notas

`plugins.txt` es la única lista: los retirados no entran, los congelados llevan el comentario `# 🧊 FROZEN` pero se instalan; los instaladores son idempotentes; `scripts/npm-downloads-snapshot.mjs` registra las descargas mensuales; las versiones siguen a npm y se fijan por plugin si necesitas reproducibilidad.

## Índice personal de plugins

`market/index.json` es un índice DSH plugin-market format 1 generado desde este roster, solo con paquetes PerryLink, publicado en `https://perrylink.github.io/dsh-kit/index.json`; se regenera con `npm run build:market` y se valida sin red con `npm run check:market`.

## Comentarios

Abre incidencias o peticiones en el repositorio del plugin correspondiente, o debate sobre toda la familia en las DeepSeek Harness Discussions oficiales (categoría “Show Your Plugins!”).

## Familia de plugins PerryLink DSH

Este repositorio forma parte de la familia de plugins de DeepSeek Harness de [PerryLink](https://github.com/PerryLink); las tres capas y la línea Phocinae están en [FAMILY.md](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md) y el roster completo en el [README.md](README.md) en inglés.

## Fuera del roster de instalación

Dos superficies son solo de catálogo: `dsh-translate` 0.3.2 y la suite de investigación de 19 paquetes; se instalan por nombre y no están en `plugins.txt` / `family.txt`, así que `install-all` no las instala.

## Cobertura de compatibilidad

`dsh-hcb` 0.12.0 registra 143 filas (136 checked + 7 tested) sobre el roster de 112 paquetes de la familia más 31 plugins externos; el checker marca 143/143 filas en `dsh-standards@1.7.0`. El detalle está en la sección Compatibility coverage del README en inglés.

[Privacy](PRIVACY.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)
