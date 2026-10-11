/*
 * DV Experiments: public GitHub project discovery.
 * For each public repository, reads its optional dv-project.json at the root
 * of the default branch. Never requires a browser token or accesses private repos.
 * See docs/PROJECT_METADATA.md.
 */
(() => {
  'use strict';
  const OWNER = 'DVExperiments';
  const FILE = 'dv-project.json';
  const HUB_REPO = 'dvexperiments.github.io';
  const MAX_PAGES = 10; // Up to 1,000 public repositories; stop at first short page.
  const DEFAULT_COVER = 'assets/cover-default.svg';

  const isHttps = value => typeof value === 'string' && /^https:\/\/[^\s<>"']+$/i.test(value);
  const trimmed = value => typeof value === 'string' ? value.trim().slice(0, 12000) : '';
  const words = value => String(value || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
  const slugify = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const uniqueStrings = value => Array.isArray(value) ? value.filter(v => typeof v === 'string' && v.trim()).slice(0, 24).map(v => v.trim().slice(0, 250)) : null;

  function metadataURL(repo) {
    const branch = String(repo.default_branch || 'main').split('/').map(encodeURIComponent).join('/');
    return `https://raw.githubusercontent.com/${encodeURIComponent(OWNER)}/${encodeURIComponent(repo.name)}/${branch}/${FILE}`;
  }
  function coverURL(repo, cover) {
    if (isHttps(cover)) return cover;
    if (typeof cover === 'string' && /^(?!\/|\.\/|.*\.\.)[\w./-]+\.(?:png|jpg|jpeg|webp|svg|gif)$/i.test(cover)) {
      const branch = String(repo.default_branch || 'main').split('/').map(encodeURIComponent).join('/');
      return `https://raw.githubusercontent.com/${encodeURIComponent(OWNER)}/${encodeURIComponent(repo.name)}/${branch}/${cover.split('/').map(encodeURIComponent).join('/')}`;
    }
    return '';
  }
  async function requestJson(url) {
    const response = await fetch(url, {headers: {'Accept': 'application/vnd.github+json'}});
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  }
  async function getRepos() {
    const result = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const query = new URLSearchParams({per_page:'100', type:'owner', sort:'updated', page:String(page)});
      const batch = await requestJson(`https://api.github.com/users/${OWNER}/repos?${query}`);
      if (!Array.isArray(batch)) throw new Error('Unexpected GitHub response');
      result.push(...batch);
      if (batch.length < 100) break;
    }
    return result.filter(r => r && !r.private && !r.fork && !r.archived && !r.disabled && r.name.toLowerCase() !== HUB_REPO);
  }
  async function metadataFor(repo) {
    try {
      const result = await fetch(metadataURL(repo));
      if (!result.ok) return {};
      const data = await result.json();
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (_) { return {}; }
  }
  async function pagesURL(repo) {
    if (!repo.has_pages) return '';
    try {
      const info = await requestJson(`https://api.github.com/repos/${encodeURIComponent(OWNER)}/${encodeURIComponent(repo.name)}/pages`);
      if (isHttps(info.html_url)) return info.html_url;
    } catch (_) { /* Pages metadata may not be public; safe fallback below */ }
    if (isHttps(repo.homepage)) return repo.homepage;
    return `https://${OWNER.toLowerCase()}.github.io/${encodeURIComponent(repo.name)}/`;
  }
  async function withConcurrency(items, concurrency, fn) {
    const results = new Array(items.length);
    let nextIndex = 0;
    await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, async () => {
      for (;;) {
        const index = nextIndex++;
        if (index >= items.length) break;
        results[index] = await fn(items[index]);
      }
    }));
    return results;
  }
  function chooseText(value, fallback) {
    return typeof value === 'string' ? trimmed(value) : trimmed(fallback);
  }
  function normaliseOne(repo, metadata, pagesUrl, local) {
    const data = metadata || {};
    if (data.visible === false) return null;
    // Local project fields are fallback presentation settings only. The optional
    // per-repository JSON and live Github metadata take priority on public repos.
    const githubDescription = trimmed(repo.description);
    const description = chooseText(data.description, githubDescription || (local ? local.description : '') || 'A public project in the DV Experiments collection.');
    const overview = uniqueStrings(data.overview) ?? (githubDescription ? [githubDescription] : (description ? [description] : []));
    const highlights = uniqueStrings(data.highlights) ?? [];
    const tags = uniqueStrings(data.tags) ?? (Array.isArray(repo.topics) && repo.topics.length ? repo.topics : local?.tags || []);
    const cover = coverURL(repo, data.cover);
    const hasPages = Boolean(repo.has_pages);
    return {
      slug: local?.slug || slugify(repo.name),
      title: chooseText(data.title, local?.title || words(repo.name)),
      tagline: chooseText(data.tagline, description.length > 105 ? `${description.slice(0, 102)}…` : description),
      description,
      category: chooseText(data.category, local?.category || 'Experiments'),
      platform: chooseText(data.platform, repo.language || local?.platform || 'GitHub project'),
      year: chooseText(data.year, (repo.created_at || '').slice(0, 4) || new Date().getFullYear().toString()),
      featured: typeof data.featured === 'boolean' ? data.featured : Boolean(local?.featured),
      image: cover || (local?.image || DEFAULT_COVER),
      imageAlt: chooseText(data.imageAlt, local?.imageAlt || `Project cover for ${repo.name}`),
      overview, highlights, tags,
      status: hasPages ? 'live' : 'repository',
      liveUrl: hasPages ? (isHttps(data.liveUrl) ? data.liveUrl : pagesUrl) : '',
      repoUrl: isHttps(repo.html_url) ? repo.html_url : `https://github.com/${OWNER}/${encodeURIComponent(repo.name)}`,
      notice: chooseText(data.notice, hasPages ? 'GitHub Pages is enabled for this project. Its published site may be an application, demo or documentation.' : 'This repository is public, but GitHub Pages is not enabled.'),
      _repoName: repo.name
    };
  }
  function matchLocal(repo, existing) {
    const fullName = `${OWNER}/${repo.name}`.toLowerCase();
    return existing.find(p => (p.repoUrl || '').toLowerCase().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '') === fullName)
      || existing.find(p => p.slug === slugify(repo.name));
  }
  async function discover(localProjects) {
    const repoList = await getRepos();
    const hiddenRepos = Array.isArray(window.DV_HIDDEN_REPOS) ? window.DV_HIDDEN_REPOS.map(x => String(x).toLowerCase()) : [];
    const repos = repoList.filter(r => !hiddenRepos.includes(r.name.toLowerCase()));
    const enriched = await withConcurrency(repos, 5, async repo => {
      const local = matchLocal(repo, localProjects);
      const [data, site] = await Promise.all([metadataFor(repo), pagesURL(repo)]);
      return normaliseOne(repo, data, site, local);
    });
    const publicProjects = enriched.filter(Boolean);
    const matchedLocals = new Set(repos.map(repo => matchLocal(repo, localProjects)).filter(Boolean));
    // Keep manually curated unpublished concepts and local projects if not yet
    // public; don't accidentally duplicate a newly published repo.
    const drafts = localProjects.filter(p => {
      if (matchedLocals.has(p)) return false;
      // Never leak an old manual entry for a repo that is now private/deleted.
      // Keep only draft concepts that have no current public GitHub URL.
      const belongsToOwner = typeof p.repoUrl === 'string' && p.repoUrl.toLowerCase().startsWith(`https://github.com/${OWNER.toLowerCase()}/`);
      return !belongsToOwner;
    });
    const all = [...publicProjects, ...drafts];
    all.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(b.status==='live') - Number(a.status==='live') || a.title.localeCompare(b.title));
    return all;
  }
  window.DV_SYNC = {discover, slugify};
})();
