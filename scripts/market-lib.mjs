// Shared helpers for the personal plugin market index (DSH plugin market format 1).
// The roster is the source of truth: this file never reads plugin directories.
import fs from 'node:fs';
import semver from 'semver';

export const PUBLIC_REGISTRY = 'https://registry.npmjs.org/';
export const PAGES_INDEX_URL = 'https://perrylink.github.io/dsh-kit/index.json';
export const DENYLIST = new Set(['dsh-phocinae']);

/** npm package names accepted by the index format (old packages may contain `_`). */
const NAME_RE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;

const LABEL_TITLES = {
  'mainline-default': { en: 'Mainline · installed by default', zh: '主线 · 默认安装' },
  'mainline-opt-in': { en: 'Mainline · opt-in', zh: '主线 · 可选' },
  'catalog-only': { en: 'Catalog only', zh: '仅目录' },
  domain: { en: 'Domain plugins', zh: '行业插件' },
  'opt-in': { en: 'Opt-in', zh: '可选安装' },
  frozen: { en: 'Frozen', zh: '冻结' },
};

/** Parse a roster file. Section headers give family labels, trailing comments give opt-in/frozen. */
export function specsOf(file) {
  const out = [];
  let section = '';
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const header = /^#\s*──\s*([a-z0-9-]+)/.exec(line);
    if (header) {
      section = header[1];
      continue;
    }
    if (line.startsWith('#')) continue;
    const [name, ...rest] = line.split(/\s+/);
    if (!NAME_RE.test(name)) continue;
    const labels = new Set();
    if (section) labels.add(section);
    const comment = rest.join(' ');
    if (/\bopt-in\b/i.test(comment)) labels.add('opt-in');
    if (/FROZEN/i.test(comment)) labels.add('frozen');
    out.push({ name, labels: [...labels].sort() });
  }
  return out;
}

/** plugins.txt order first, then family-only entries; duplicates merge their labels. */
export function roster({ pluginsFile, familyFile }) {
  const byName = new Map();
  for (const spec of [...specsOf(pluginsFile), ...specsOf(familyFile)]) {
    const seen = byName.get(spec.name);
    if (!seen) {
      byName.set(spec.name, spec);
      continue;
    }
    seen.labels = [...new Set([...seen.labels, ...spec.labels])].sort();
  }
  return [...byName.values()];
}

export function readDenylist(file) {
  if (!fs.existsSync(file)) return new Set(DENYLIST);
  const out = new Set(DENYLIST);
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const name = line.split(/\s+/)[0];
    if (NAME_RE.test(name)) out.add(name);
  }
  return out;
}

export function readDisplay(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function validDshRange(range) {
  if (typeof range !== 'string') return false;
  const text = range.trim();
  return text !== '' && !text.startsWith('workspace:') && semver.validRange(text) !== null;
}

export function normalizeURL(raw) {
  if (!raw) return '';
  const text = typeof raw === 'string' ? raw : raw.url;
  if (typeof text !== 'string' || !text.trim()) return '';
  const shorthand = /^github:([^/]+)\/([^/#]+)$/.exec(text.trim());
  let candidate = shorthand ? `https://github.com/${shorthand[1]}/${shorthand[2]}` : text.trim();
  candidate = candidate.replace(/^git\+/, '').replace(/\.git$/, '');
  try {
    const u = new URL(candidate);
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !u.host || u.username || u.password) return '';
    u.search = '';
    u.hash = '';
    return u.href.replace(/\.git$/, '');
  } catch {
    return '';
  }
}

export function httpURL(raw) {
  const url = normalizeURL(raw);
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : '';
}

export function titleFor(name) {
  const base = name.replace(/^@[^/]+\//, '').replace(/^dsh-/, '');
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(' ');
}

/** Deterministic monogram icon so every entry has a picture without fetching tarballs. */
export function monogramIcon(name) {
  const base = name.replace(/^@[^/]+\//, '').replace(/^dsh-/, '');
  const letters = (base.match(/[a-z0-9]/gi) ?? []).slice(0, 2).join('').toUpperCase() || 'DS';
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  const hue = hash % 360;
  const fontSize = letters.length > 1 ? 24 : 30;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="hsl(${hue} 65% 42%)"/><text x="32" y="41" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff" text-anchor="middle">${letters}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function bundledVersions(doc, registry = PUBLIC_REGISTRY) {
  const out = [];
  for (const [version, manifest] of Object.entries(doc?.versions ?? {})) {
    if (!manifest || manifest.private === true || manifest.deprecated) continue;
    if (!manifest.dsh?.bundle?.patch) continue;
    if (!validDshRange(manifest.engines?.dsh)) continue;
    const stamp = doc.time?.[version];
    const publishTimestamp = stamp ? Math.floor(Date.parse(stamp) / 1000) : NaN;
    if (!Number.isInteger(publishTimestamp) || publishTimestamp < 0 || publishTimestamp >= 1e11) continue;
    out.push({
      version,
      publishTimestamp,
      source: { type: 'npm', registry },
      engines: { dsh: manifest.engines.dsh.trim() },
    });
  }
  out.sort((a, b) => semver.rcompare(a.version, b.version));
  return out;
}

export function dropReason(doc) {
  const manifests = Object.values(doc?.versions ?? {});
  if (!manifests.length) return 'no-versions';
  if (!manifests.some((m) => m && m.dsh?.bundle?.patch)) return 'no-bundle';
  if (manifests.every((m) => !m || m.private === true || m.deprecated)) return 'all-deprecated';
  if (!manifests.some((m) => validDshRange(m.engines?.dsh))) return 'no-engines-dsh';
  return 'no-eligible-version';
}

export function pluginFromPackument(name, doc, { labels = [], display = {}, registry = PUBLIC_REGISTRY } = {}) {
  const versions = bundledVersions(doc, registry);
  if (!versions.length) return null;
  const latest = doc.versions?.[versions[0].version] ?? {};
  const overlay = display[name] ?? {};
  const title = overlay.title ?? titleFor(name);
  const description = overlay.description ?? (typeof latest.description === 'string' ? latest.description : '');
  const author = typeof latest.author === 'string' ? latest.author : latest.author?.name;
  const homepage = httpURL(latest.homepage);
  const repository = normalizeURL(latest.repository);
  const keywords = Array.isArray(latest.keywords) ? latest.keywords.filter((k) => typeof k === 'string') : [];
  const icon = overlay.icon ?? monogramIcon(name);
  return {
    name,
    title: { en: title, ...(overlay.titleZh ? { zh: overlay.titleZh } : {}) },
    ...(description ? { description: { en: description, ...(overlay.descriptionZh ? { zh: overlay.descriptionZh } : {}) } } : {}),
    icon,
    ...(author ? { author } : {}),
    ...(homepage ? { homepage } : {}),
    ...(repository ? { repository: { url: repository } } : {}),
    metadata: { keywords, labels: [...new Set(labels)].sort().filter((l) => l in LABEL_TITLES) },
    versions,
  };
}

export function buildIndex({ specs, packuments, denylist, display = {}, registry = PUBLIC_REGISTRY }) {
  const plugins = [];
  const dropped = [];
  const labels = new Set();
  for (const spec of specs) {
    if (denylist.has(spec.name)) continue;
    const doc = packuments.get(spec.name);
    if (!doc) {
      dropped.push({ name: spec.name, reason: 'not-found' });
      continue;
    }
    const plugin = pluginFromPackument(spec.name, doc, { labels: spec.labels, display, registry });
    if (!plugin) {
      dropped.push({ name: spec.name, reason: dropReason(doc) });
      continue;
    }
    for (const label of plugin.metadata.labels) labels.add(label);
    plugins.push(plugin);
  }
  const declared = {};
  for (const [id, title] of Object.entries(LABEL_TITLES)) {
    if (labels.has(id)) declared[id] = { title };
  }
  const index = {
    format: 1,
    title: { en: 'PerryLink personal DSH plugins', zh: 'PerryLink 个人 DSH 插件' },
    description: {
      en: 'Personal collection of PerryLink DSH plugins, generated from the dsh-kit roster.',
      zh: 'PerryLink 自己的 DSH 插件集合，由 dsh-kit 的名册生成。',
    },
    ...(Object.keys(declared).length ? { metadata: { labels: declared } } : {}),
    plugins,
  };
  return { index, dropped };
}

export function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function fetchPackument(name, { registry = PUBLIC_REGISTRY, timeoutMs = 60_000, retries = 2 } = {}) {
  const url = new URL(name.replace('/', '%2f'), registry);
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'dsh-kit-market-index' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const doc = await response.json();
      if (!doc || typeof doc !== 'object' || typeof doc.versions !== 'object') throw new Error('invalid packument');
      return doc;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw new Error(`${name}: ${lastError?.message ?? 'fetch failed'}`);
}

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      out[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return out;
}
