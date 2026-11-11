#!/usr/bin/env node
// Build market/index.json (DSH plugin market format 1) from the dsh-kit roster.
// The roster is the only input: plugins.txt first, then family-only entries.
import fs from 'node:fs';
import path from 'node:path';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import {
  PAGES_INDEX_URL,
  PUBLIC_REGISTRY,
  buildIndex,
  fetchPackument,
  mapLimit,
  readDenylist,
  readDisplay,
  roster,
  serialize,
} from './market-lib.mjs';

function parseArgs(argv) {
  const opts = {
    root: process.cwd(),
    plugins: 'plugins.txt',
    family: 'family.txt',
    denylist: 'market/denylist.txt',
    display: 'market/display.json',
    out: 'market',
    registry: PUBLIC_REGISTRY,
    concurrency: 8,
    check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') { opts.check = true; continue; }
    const value = argv[++i];
    if (value === undefined) throw new Error(`缺少 ${arg} 的值`);
    switch (arg) {
      case '--root': opts.root = value; break;
      case '--plugins': opts.plugins = value; break;
      case '--family': opts.family = value; break;
      case '--denylist': opts.denylist = value; break;
      case '--display': opts.display = value; break;
      case '--out': opts.out = value; break;
      case '--registry': opts.registry = value; break;
      case '--concurrency': opts.concurrency = Number(value); break;
      default: throw new Error(`未知参数 ${arg}`);
    }
  }
  if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) throw new Error('--concurrency 必须是正整数');
  if (opts.registry) opts.registry = new URL(opts.registry).href.replace(/\/?$/, '/');
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const root = path.resolve(opts.root);
  const file = (relative) => path.resolve(root, relative);
  const specs = roster({ pluginsFile: file(opts.plugins), familyFile: file(opts.family) });
  const denylist = readDenylist(file(opts.denylist));
  const display = readDisplay(file(opts.display));
  const targets = specs.filter((spec) => !denylist.has(spec.name));
  console.log(`roster: ${specs.length} specs, ${targets.length} to fetch (${denylist.size} denylisted)`);

  const entries = await mapLimit(targets, opts.concurrency, async (spec) => {
    try {
      return [spec.name, await fetchPackument(spec.name, { registry: opts.registry })];
    } catch (error) {
      return [spec.name, { __error: error.message }];
    }
  });
  const packuments = new Map();
  const errors = [];
  for (const [name, doc] of entries) {
    if (doc?.__error) errors.push(`${name}: ${doc.__error}`);
    else packuments.set(name, doc);
  }
  if (errors.length) {
    console.error(`拉取 npm 元数据失败 ${errors.length} 个：\n  ${errors.join('\n  ')}`);
    process.exit(2);
  }

  const { index, dropped } = buildIndex({
    specs,
    packuments,
    denylist,
    display,
    registry: opts.registry,
  });
  let parsed;
  try {
    parsed = parseMarketIndex(index, new URL(PAGES_INDEX_URL));
  } catch (error) {
    console.error(`生成的索引没通过官方校验器：${error.message}`);
    process.exit(1);
  }
  const indexText = serialize(parsed);
  const droppedText = serialize({ dropped });

  const outDir = file(opts.out);
  const indexFile = path.join(outDir, 'index.json');
  const droppedFile = path.join(outDir, 'dropped.json');
  if (opts.check) {
    const same = fs.existsSync(indexFile) && fs.readFileSync(indexFile, 'utf8') === indexText
      && fs.existsSync(droppedFile) && fs.readFileSync(droppedFile, 'utf8') === droppedText;
    if (!same) {
      console.error('market/index.json 或 dropped.json 与 roster 不一致；运行 npm run build:market 重新生成。');
      process.exit(1);
    }
    console.log(`OK: ${parsed.plugins.length} plugins, ${parsed.plugins.reduce((n, p) => n + p.versions.length, 0)} versions`);
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(indexFile, indexText);
  fs.writeFileSync(droppedFile, droppedText);
  const versions = parsed.plugins.reduce((n, p) => n + p.versions.length, 0);
  const reasons = new Map();
  for (const item of dropped) reasons.set(item.reason, (reasons.get(item.reason) ?? 0) + 1);
  console.log(`wrote ${path.relative(root, indexFile)}: ${parsed.plugins.length} plugins, ${versions} versions, ${(indexText.length / 1024).toFixed(1)} KiB`);
  if (dropped.length) {
    console.log(`dropped ${dropped.length}: ${[...reasons].map(([r, n]) => `${r}=${n}`).join(', ')}`);
    for (const item of dropped) console.log(`  - ${item.name}: ${item.reason}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
