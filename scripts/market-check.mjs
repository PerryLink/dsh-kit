#!/usr/bin/env node
// Offline checks for the committed personal market index. No network access.
import fs from 'node:fs';
import path from 'node:path';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import {
  PAGES_INDEX_URL,
  readDenylist,
  readDisplay,
  roster,
  validDshRange,
} from './market-lib.mjs';

const root = process.cwd();
const file = (relative) => path.resolve(root, relative);
const errors = [];
const fail = (message) => errors.push(message);

const specs = roster({ pluginsFile: file('plugins.txt'), familyFile: file('family.txt') });
const denylist = readDenylist(file('market/denylist.txt'));
const display = readDisplay(file('market/display.json'));
const rosterNames = new Set(specs.map((spec) => spec.name));
const expected = new Set([...rosterNames].filter((name) => !denylist.has(name)));

let index;
try {
  index = parseMarketIndex(JSON.parse(fs.readFileSync(file('market/index.json'), 'utf8')), new URL(PAGES_INDEX_URL));
} catch (error) {
  console.error(`market/index.json 未通过官方校验器：${error.message}`);
  process.exit(1);
}
const droppedDoc = JSON.parse(fs.readFileSync(file('market/dropped.json'), 'utf8'));
const dropped = Array.isArray(droppedDoc.dropped) ? droppedDoc.dropped : [];
const droppedNames = new Set(dropped.map((item) => item.name));

// 1. Coverage: roster − denylist = index ∪ dropped, no duplicates or extras.
const seen = new Set();
for (const plugin of index.plugins) {
  if (seen.has(plugin.name)) fail(`index 里重复的插件 ${plugin.name}`);
  seen.add(plugin.name);
  if (!expected.has(plugin.name)) fail(`index 里有 roster 之外的插件 ${plugin.name}`);
}
for (const name of droppedNames) {
  if (seen.has(name)) fail(`${name} 同时出现在 index 和 dropped`);
  if (!expected.has(name)) fail(`dropped 里有 roster 之外的插件 ${name}`);
}
for (const name of expected) {
  if (!seen.has(name) && !droppedNames.has(name)) fail(`roster 里的 ${name} 既不在 index 也不在 dropped`);
}
const allowedReasons = new Set(['not-found', 'no-versions', 'no-bundle', 'all-deprecated', 'no-engines-dsh', 'no-eligible-version']);
for (const item of dropped) {
  if (!allowedReasons.has(item.reason)) fail(`dropped ${item.name} 的原因未知：${item.reason}`);
}

// 2. Only PerryLink-owned packages; never DeepSeek first-party packages.
for (const plugin of index.plugins) {
  if (plugin.name.startsWith('@deepseek-ai/')) fail(`不应收录 DeepSeek 官方包 ${plugin.name}`);
  if (denylist.has(plugin.name)) fail(`denylist 里的 ${plugin.name} 仍出现在 index`);
  if (plugin.repository?.url && !/^https:\/\/github\.com\/PerryLink\//i.test(plugin.repository.url)) {
    fail(`${plugin.name} 的 repository 不在 github.com/PerryLink 下：${plugin.repository.url}`);
  }
}

// 3. Version fields the format allows but our generator must keep strict.
for (const plugin of index.plugins) {
  for (const version of plugin.versions) {
    if (version.source.type !== 'npm') fail(`${plugin.name}@${version.version} 不是 npm source`);
    if (version.source.registry && !/^https?:\/\//.test(version.source.registry)) {
      fail(`${plugin.name}@${version.version} 的 registry 不是 http(s) URL`);
    }
    if (!version.engines.dsh || !validDshRange(version.engines.dsh)) {
      fail(`${plugin.name}@${version.version} 缺少合法的 engines.dsh`);
    }
  }
}

// 4. Denylist and display overlay must not rot.
for (const name of denylist) {
  if (!rosterNames.has(name)) fail(`denylist 里的 ${name} 已不在 roster 中，请删除`);
}
for (const name of Object.keys(display)) {
  if (!seen.has(name)) fail(`display.json 里的 ${name} 不在 index 中`);
}
for (const [name, overlay] of Object.entries(display)) {
  if (overlay.icon && !/^(?:https:\/\/|data:image\/)/.test(overlay.icon)) {
    fail(`display ${name} 的 icon 必须是 https 或 data:image/`);
  }
}

if (errors.length) {
  console.error(`market-check 失败 ${errors.length} 项：`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
const versions = index.plugins.reduce((n, plugin) => n + plugin.versions.length, 0);
console.log(`OK: ${index.plugins.length} plugins, ${versions} versions, ${dropped.length} dropped, ${(fs.statSync(file('market/index.json')).size / 1024).toFixed(1)} KiB`);
