import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import {
  PAGES_INDEX_URL,
  buildIndex,
  dropReason,
  monogramIcon,
  pluginFromPackument,
  roster,
  specsOf,
} from './market-lib.mjs';

const time = '2026-01-02T03:04:05.000Z';

function manifest(version, extra = {}) {
  return {
    name: 'dsh-demo',
    version,
    description: 'A demo plugin',
    dsh: { bundle: { patch: './cordis.patch.yml' } },
    engines: { dsh: '>=0.2.0-0 <0.3.0' },
    keywords: ['dsh', 'demo'],
    author: 'PerryLink',
    homepage: 'https://github.com/PerryLink/dsh-demo',
    repository: { type: 'git', url: 'git+https://github.com/PerryLink/dsh-demo.git' },
    ...extra,
  };
}

function doc(versions) {
  return {
    name: 'dsh-demo',
    versions,
    time: Object.fromEntries(Object.keys(versions).map((version) => [version, time])),
  };
}

test('pluginFromPackument keeps bundle versions with engines and normalizes display fields', () => {
  const packument = doc({
    '1.0.0': manifest('1.0.0'),
    '1.1.0': manifest('1.1.0', { engines: { dsh: '>=0.2.1-0 <0.3.0' } }),
    '0.9.0': manifest('0.9.0', { engines: {} }),
    '0.8.0': manifest('0.8.0', { deprecated: 'use 1.0.0' }),
    '0.7.0': manifest('0.7.0', { private: true }),
    '0.6.0': { name: 'dsh-demo', version: '0.6.0' },
  });
  const plugin = pluginFromPackument('dsh-demo', packument, { labels: ['mainline-default'] });
  assert.deepEqual(plugin.versions.map((version) => version.version), ['1.1.0', '1.0.0']);
  assert.equal(plugin.versions[0].engines.dsh, '>=0.2.1-0 <0.3.0');
  assert.equal(plugin.versions[1].engines.dsh, '>=0.2.0-0 <0.3.0');
  assert.equal(plugin.repository.url, 'https://github.com/PerryLink/dsh-demo');
  assert.equal(plugin.title.en, 'Demo');
  assert.deepEqual(plugin.metadata.labels, ['mainline-default']);
  assert.ok(plugin.icon.startsWith('data:image/svg+xml;base64,'));
});

test('pluginFromPackument returns null and dropReason explains why', () => {
  const noBundle = doc({ '1.0.0': { name: 'x', version: '1.0.0' } });
  assert.equal(pluginFromPackument('x', noBundle), null);
  assert.equal(dropReason(noBundle), 'no-bundle');
  const noEngines = doc({ '1.0.0': manifest('1.0.0', { engines: {} }) });
  assert.equal(pluginFromPackument('x', noEngines), null);
  assert.equal(dropReason(noEngines), 'no-engines-dsh');
  const deprecated = doc({ '1.0.0': manifest('1.0.0', { deprecated: 'old' }) });
  assert.equal(pluginFromPackument('x', deprecated), null);
  assert.equal(dropReason(deprecated), 'all-deprecated');
});

test('monogram icon is deterministic and within the inline icon limit', () => {
  const first = monogramIcon('dsh-memento');
  assert.equal(first, monogramIcon('dsh-memento'));
  const payload = first.slice('data:image/svg+xml;base64,'.length);
  assert.ok(Buffer.from(payload, 'base64').length <= 32 * 1024);
});

test('roster merges plugins.txt order with family labels and skips comments', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-kit-market-'));
  const plugins = path.join(dir, 'plugins.txt');
  const family = path.join(dir, 'family.txt');
  fs.writeFileSync(plugins, '# header\ndsh-b  # opt-in\ndsh-a\ndsh-community-bench\n');
  fs.writeFileSync(family, '# ── mainline-default (2) ──\ndsh-a\ndsh-b\n# ── domain (1) ──\ndsh-domain-only\n');
  assert.deepEqual(specsOf(plugins), [
    { name: 'dsh-b', labels: ['opt-in'] },
    { name: 'dsh-a', labels: [] },
    { name: 'dsh-community-bench', labels: [] },
  ]);
  assert.deepEqual(roster({ pluginsFile: plugins, familyFile: family }), [
    { name: 'dsh-b', labels: ['mainline-default', 'opt-in'] },
    { name: 'dsh-a', labels: ['mainline-default'] },
    { name: 'dsh-community-bench', labels: [] },
    { name: 'dsh-domain-only', labels: ['domain'] },
  ]);
});

test('buildIndex produces an index the official validator accepts', () => {
  const packuments = new Map([
    ['dsh-demo', doc({ '1.0.0': manifest('1.0.0') })],
  ]);
  const { index, dropped } = buildIndex({
    specs: [
      { name: 'dsh-demo', labels: ['mainline-default'] },
      { name: 'dsh-gone', labels: [] },
    ],
    packuments,
    denylist: new Set(),
  });
  assert.deepEqual(dropped, [{ name: 'dsh-gone', reason: 'not-found' }]);
  const parsed = parseMarketIndex(index, new URL(PAGES_INDEX_URL));
  assert.equal(parsed.plugins.length, 1);
  assert.equal(parsed.plugins[0].name, 'dsh-demo');
  assert.equal(parsed.plugins[0].versions.length, 1);
});
