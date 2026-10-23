#!/usr/bin/env node
/**
 * Builds data/projects.json and data/readme/*.html from your public GitHub repos.
 *
 * Runs in GitHub Actions on a schedule (see .github/workflows/deploy.yml), or
 * locally with:   GITHUB_TOKEN=xxxx node scripts/build-data.mjs
 * (a token is optional locally, but without one GitHub allows only 60 calls/hour).
 *
 * Where each field comes from, highest priority first:
 *   cover        dashboard.config.json -> covers/<repo>.<ext> -> README marker -> dv-project.json
 *                -> custom social preview image -> first image in README -> generated art
 *   description  dashboard.config.json -> README marker -> dv-project.json -> repo "About" text
 *                -> first paragraph of README
 */
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const README_DIR = path.join(DATA_DIR, 'readme');
const config = JSON.parse(await readFile(path.join(ROOT, 'dashboard.config.json'), 'utf8'));

const USER = config.username;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const SELF_REPO = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';
const API = 'https://api.github.com';
const IMAGE_EXT = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'avif'];

const lc = (s) => String(s ?? '').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let apiCalls = 0;

// ---------------------------------------------------------------- GitHub access

async function gh(url, { accept = 'application/vnd.github+json', as = 'json', method = 'GET', body } = {}) {
  const headers = {
    Accept: accept,
    'User-Agent': `${USER}-project-dashboard`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  if (body) headers['Content-Type'] = 'application/json';

  for (let attempt = 0; attempt < 3; attempt++) {
    apiCalls++;
    const res = await fetch(url.startsWith('http') ? url : API + url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 404 || res.status === 409) return null; // missing, or empty repo
    if (res.ok) return as === 'json' ? res.json() : res.text();
    if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
      throw new Error(
        `GitHub API rate limit reached after ${apiCalls} calls.` +
          (TOKEN ? '' : ' Set GITHUB_TOKEN to raise the limit from 60 to 5,000 calls an hour.'),
      );
    }
    if (res.status >= 500 || res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    throw new Error(`GitHub returned ${res.status} ${res.statusText} for ${url}`);
  }
  throw new Error(`GitHub kept failing for ${url}`);
}

async function rawFile(owner, repo, branch, file) {
  const res = await fetch(
    `https://raw.githubusercontent.com/${owner}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${file}`,
  );
  return res.ok ? res.text() : null;
}

async function listRepos() {
  const repos = [];
  for (let page = 1; page < 20; page++) {
    const batch = await gh(`/users/${USER}/repos?type=owner&sort=pushed&per_page=100&page=${page}`);
    if (!batch) throw new Error(`GitHub user "${USER}" was not found. Check "username" in dashboard.config.json.`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function getUser() {
  const u = await gh(`/users/${USER}`);
  return u
    ? { login: u.login, name: u.name || u.login, avatar: u.avatar_url, bio: u.bio || '', url: u.html_url }
    : { login: USER, name: USER, avatar: '', bio: '', url: `https://github.com/${USER}` };
}

/** Custom social preview images (repo Settings -> Social preview). Needs a token (GraphQL). */
async function socialPreviews() {
  const map = new Map();
  if (!TOKEN) return map;
  const query = `query($login: String!, $cursor: String) {
    repositoryOwner(login: $login) {
      repositories(first: 100, after: $cursor, privacy: PUBLIC, ownerAffiliations: OWNER) {
        pageInfo { hasNextPage endCursor }
        nodes { name openGraphImageUrl usesCustomOpenGraphImage }
      }
    }
  }`;
  try {
    let cursor = null;
    for (let i = 0; i < 20; i++) {
      const res = await gh('/graphql', { method: 'POST', body: { query, variables: { login: USER, cursor } } });
      const conn = res?.data?.repositoryOwner?.repositories;
      if (!conn) break;
      for (const n of conn.nodes) if (n.usesCustomOpenGraphImage) map.set(lc(n.name), n.openGraphImageUrl);
      if (!conn.pageInfo.hasNextPage) break;
      cursor = conn.pageInfo.endCursor;
    }
  } catch (err) {
    console.warn(`  (social preview images skipped: ${err.message})`);
  }
  return map;
}

async function coverFiles() {
  const map = new Map();
  try {
    for (const file of await readdir(path.join(ROOT, 'covers'))) {
      const ext = lc(path.extname(file).slice(1));
      if (IMAGE_EXT.includes(ext)) map.set(lc(path.basename(file, path.extname(file))), `covers/${file}`);
    }
  } catch {
    /* no covers folder */
  }
  return map;
}

// ---------------------------------------------------------------- README parsing

/** <!-- dashboard ... --> block of "key: value" lines. Invisible on GitHub. */
export function parseMarker(md) {
  const out = {};
  const m = md.match(/<!--\s*dashboard\b([\s\S]*?)-->/i);
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*([a-z_-]+)\s*:\s*(.*?)\s*$/i);
    if (kv && kv[2]) out[lc(kv[1])] = kv[2];
  }
  return out;
}

const isBadge = (url) =>
  /shields\.io|badgen\.net|badge|travis-ci|codecov|circleci|\/actions\/workflows\/|gitter\.im|forthebadge/i.test(url);

export function firstImage(md) {
  const found = [];
  const mdImg = /!\[[^\]]*\]\(\s*<?([^)\s>]+)/g;
  const htmlImg = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;
  for (const re of [mdImg, htmlImg]) {
    let m;
    while ((m = re.exec(md))) if (!isBadge(m[1])) found.push({ i: m.index, url: m[1] });
  }
  found.sort((a, b) => a.i - b.i);
  return found[0]?.url || null;
}

export function firstHeading(md) {
  const atx = md.match(/^#\s+(.+?)\s*#*\s*$/m);
  if (atx) return atx[1];
  const setext = md.match(/^([^\n]+)\n=+\s*$/m);
  return setext ? setext[1].trim() : null;
}

export function plainText(s) {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/[*_~`]+/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sentences about versions, releases and setup make poor descriptions.
const NOISE = /\b(release[sd]?|version|changelog|v\d+(\.\w+)+|requires|this (zip|patch|update)|upload)\b/i;
const SKIP_START = /^(version|target|requires|note|changelog|status|built with|license|warning|important)\b/i;

export function firstParagraph(md) {
  const cleaned = md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^[^\n]+\n\s*(=+|-+)\s*$/gm, '') // setext headings
    .replace(/^#{1,6}\s.*$/gm, ''); // atx headings
  for (const block of cleaned.split(/\r?\n\s*\r?\n/)) {
    const b = block.trim();
    if (!b) continue;
    if (/^(\||>|<|!\[|\[!\[|[-*+]\s|\d+\.\s|={3,}|-{3,}|\s{4})/.test(b)) continue;
    if (b.split(/\r?\n/).every((l) => l === l.toUpperCase())) continue; // SHOUTED section titles
    const text = plainText(b);
    if (SKIP_START.test(text)) continue;
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z"'“‘(])/);
    const kept = sentences.filter((x, i) => i === 0 || !NOISE.test(x)).join(' ').trim();
    if (kept.length >= 40) return truncate(kept, 260);
  }
  return '';
}

export function truncate(s, n) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sentence = cut.lastIndexOf('. ');
  if (sentence > n * 0.55) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
}

export function prettyName(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((w) => (w === lc(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

const squash = (s) => lc(s).replace(/[^a-z0-9]/g, '');

/** Use the README heading only when it is clearly the project's name (it often has nicer casing). */
export function goodTitle(heading, name) {
  if (!heading) return null;
  let t = plainText(heading)
    .split(/\s[—–-]\s|:\s/)[0]
    .replace(/[^\p{L}\p{N}\s.&'+-]/gu, ' ')
    .replace(/\bv?\d+(\.\w+)+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t || squash(t) !== squash(name)) return null;
  if (t === t.toUpperCase()) {
    t = t.split(' ').map((w) => (w.length > 3 ? w.charAt(0) + lc(w.slice(1)) : w)).join(' ');
  }
  return t;
}

// ---------------------------------------------------------------- URL handling

export function makeResolver({ owner, repo, branch, readmePath = 'README.md' }) {
  const dir = path.posix.dirname(readmePath);
  return (url, kind = 'src') => {
    if (!url) return url;
    const blob = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+?)(\?raw=true)?$/i);
    if (blob && kind === 'src') return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
    const [p, hash] = url.split('#');
    let full = p.startsWith('/') ? p.slice(1) : path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, p));
    full = full.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    return kind === 'src'
      ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${full}`
      : `https://github.com/${owner}/${repo}/blob/${branch}/${full}${hash ? '#' + hash : ''}`;
  };
}

export function rewriteReadmeHtml(html, resolve) {
  return html
    .replace(/(<(?:img|source|video)\b[^>]*?\s(?:src|poster))=(["'])(.*?)\2/gi, (_, pre, q, u) => `${pre}=${q}${resolve(u, 'src')}${q}`)
    .replace(/(<a\b[^>]*?\shref)=(["'])(.*?)\2/gi, (_, pre, q, u) => `${pre}=${q}${resolve(u, 'href')}${q}`)
    .replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy"');
}

const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s.trim());

// ---------------------------------------------------------------- per-repo build

const overrides = Object.fromEntries(Object.entries(config.projects || {}).map(([k, v]) => [lc(k), v || {}]));
const featured = (config.featured || []).map(lc);
const excluded = new Set((config.exclude || []).map(lc));

function splitTags(v) {
  if (Array.isArray(v)) return v.map(String);
  return v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [];
}

async function buildProject(repo, ctx) {
  const owner = repo.owner.login;
  const name = repo.name;
  const branch = repo.default_branch || 'main';
  const key = lc(name);
  const over = overrides[key] || {};

  let readme = null;
  let readmeHtml = null;
  let languages = {};
  let dv = {};
  {
    // (repo.size can read 0 for a while after a repo is created, so always try)
    const [meta, html, langs, dvText] = await Promise.all([
      gh(`/repos/${owner}/${name}/readme`).catch(() => null),
      gh(`/repos/${owner}/${name}/readme`, { accept: 'application/vnd.github.html+json', as: 'text' }).catch(() => null),
      gh(`/repos/${owner}/${name}/languages`).catch(() => null),
      rawFile(owner, name, branch, 'dv-project.json').catch(() => null),
    ]);
    if (meta?.content) readme = { path: meta.path, text: Buffer.from(meta.content, 'base64').toString('utf8') };
    readmeHtml = html;
    languages = langs || {};
    try {
      dv = dvText ? JSON.parse(dvText) : {};
    } catch {
      console.warn(`  ${name}: dv-project.json is not valid JSON, ignoring it`);
    }
  }

  const md = readme?.text || '';
  const marker = parseMarker(md);
  const resolve = makeResolver({ owner, repo: name, branch, readmePath: readme?.path });

  if (over.hidden || /^(true|yes|1)$/i.test(marker.hide || marker.hidden || '')) return { hidden: true, name };

  // cover
  let cover = null;
  let coverSource = 'generated';
  const pick = (url, source, viaRepo = true) => {
    if (cover || !url) return;
    cover = viaRepo ? resolve(String(url).trim(), 'src') : url;
    coverSource = source;
  };
  if (over.cover) pick(over.cover, 'config', isUrl(over.cover));
  if (!cover && ctx.covers.has(key)) pick(ctx.covers.get(key), 'covers folder', false);
  pick(marker.cover, 'readme marker');
  pick(dv.cover || dv.image, 'dv-project.json');
  pick(ctx.previews.get(key), 'social preview', false);
  pick(firstImage(md), 'readme image');

  // text
  const description =
    over.description || marker.description || dv.tagline || dv.description || repo.description || firstParagraph(md) || '';
  const title =
    over.title || marker.title || dv.title || goodTitle(firstHeading(md), name) || prettyName(name);
  const tags = splitTags(over.tags ?? marker.tags ?? (dv.tags?.length ? dv.tags : repo.topics));

  // links
  const homepage = isUrl(repo.homepage) ? repo.homepage.trim() : null;
  const pagesUrl = repo.has_pages
    ? key === `${lc(owner)}.github.io`
      ? `https://${lc(owner)}.github.io/`
      : `https://${lc(owner)}.github.io/${name}/`
    : null;
  const liveUrl = over.live || marker.live || homepage || pagesUrl;

  if (readmeHtml) {
    await writeFile(path.join(README_DIR, `${key}.html`), rewriteReadmeHtml(readmeHtml, resolve));
  }

  return {
    name,
    title,
    description,
    longDescription: dv.description && dv.description !== description ? dv.description : '',
    category: over.category || marker.category || dv.category || config.defaultCategory || 'Experiments',
    tags: tags.slice(0, 12),
    highlights: Array.isArray(dv.highlights) ? dv.highlights.slice(0, 12) : [],
    featured: featured.includes(key) || /^(true|yes|1)$/i.test(marker.featured || '') || over.featured === true,
    cover,
    coverSource,
    hasPages: !!repo.has_pages,
    liveUrl,
    repoUrl: repo.html_url,
    language: repo.language,
    languages,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null,
    archived: !!repo.archived,
    createdAt: repo.created_at,
    updatedAt: repo.pushed_at || repo.updated_at,
    hasReadme: !!readmeHtml,
    readmeUrl: readme ? `https://github.com/${owner}/${name}/blob/${branch}/${readme.path}` : null,
  };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

// ---------------------------------------------------------------- main

async function main() {
  console.log(`Building dashboard data for ${USER}${TOKEN ? ' (authenticated)' : ' (no token: 60 calls/hour)'}`);
  await rm(README_DIR, { recursive: true, force: true });
  await mkdir(README_DIR, { recursive: true });

  const [user, all, previews, covers] = await Promise.all([getUser(), listRepos(), socialPreviews(), coverFiles()]);
  const repos = all.filter((r) => {
    const k = lc(r.name);
    if (r.private) return false;
    if (r.fork && !config.includeForks) return false;
    if (r.archived && config.includeArchived === false) return false;
    if (excluded.has(k) || k === lc(SELF_REPO) || k === `${lc(USER)}.github.io`) return false;
    return true;
  });
  console.log(`  ${all.length} public repos found, ${repos.length} included`);

  const results = (
    await mapLimit(repos, 4, async (repo) => {
      try {
        return await buildProject(repo, { previews, covers });
      } catch (err) {
        if (/rate limit/i.test(err.message)) throw err;
        console.warn(`  ${repo.name}: ${err.message}`);
        return null;
      }
    })
  ).filter(Boolean);
  const hidden = results.filter((p) => p.hidden).map((p) => p.name);
  const projects = results.filter((p) => !p.hidden);

  const data = {
    generatedAt: new Date().toISOString(),
    user,
    site: { title: config.siteTitle, tagline: config.tagline, intro: config.intro },
    hidden,
    projects,
  };
  await writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(data, null, 2));
  console.log(`  wrote ${projects.length} projects using ${apiCalls} API calls`);
  for (const p of projects) {
    const notes = [`cover: ${p.coverSource}`];
    if (!p.description) notes.push('NO DESCRIPTION (add an About text on GitHub or a README intro)');
    console.log(`   - ${p.name.padEnd(28)} ${notes.join(', ')}`);
  }
  if (hidden.length) console.log(`  hidden: ${hidden.join(', ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`\nBuild failed: ${err.message}`);
    process.exit(1);
  });
}
