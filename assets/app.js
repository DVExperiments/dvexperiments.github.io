/* DV Experiments dashboard
 *
 * Data comes from data/projects.json (built hourly by GitHub Actions). After
 * the page draws, one call to the GitHub API checks for repos created since the
 * last build, so a brand-new repo shows up straight away. If projects.json is
 * missing (for example before the first build) the whole site runs from the API.
 */
(() => {
  'use strict';

  // ------------------------------------------------------------- helpers

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const lc = (s) => String(s ?? '').toLowerCase();
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const LANG_COLORS = {
    JavaScript: '#E8C441', TypeScript: '#3178C6', Python: '#3F7CB8', HTML: '#E34C26', CSS: '#7E57C2',
    SCSS: '#C6538C', Shell: '#89E051', Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', Kotlin: '#A97BFF',
    Swift: '#F05138', 'C#': '#178600', 'C++': '#F34B7D', C: '#6E7681', Ruby: '#CC342D', PHP: '#777BB4',
    Dart: '#00B4AB', Vue: '#41B883', Svelte: '#FF3E00', Lua: '#000080', GDScript: '#355570',
    'Jupyter Notebook': '#DA5B0B', Batchfile: '#C1F12E', PowerShell: '#012456', Dockerfile: '#384D54',
  };
  const langColor = (l) => LANG_COLORS[l] || 'var(--muted)';

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  function relTime(iso) {
    if (!iso) return '';
    const s = (new Date(iso).getTime() - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [u, sec] of units) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), u);
    return 'just now';
  }
  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function seeded(seed) {
    let a = seed || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function prettyName(name) {
    return name
      .replace(/[-_]+/g, ' ')
      .split(' ')
      .map((w) => (w === lc(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  const ICON = {
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    star: '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>',
  };

  // ------------------------------------------------------------- state

  const state = {
    config: {},
    user: null,
    generatedAt: null,
    hidden: new Set(),
    projects: [],
    fromBuild: new Set(),
    mode: 'static', // 'static' = built data available, 'live' = API only
    loaded: false,
    loadError: null,
    filters: { q: '', status: 'all', category: 'all', sort: 'featured' },
    dashScroll: 0,
    readmes: new Map(),
  };

  const cfg = () => state.config;
  const owner = () => state.user?.login || cfg().username;
  const override = (name) => {
    const projects = cfg().projects || {};
    for (const k in projects) if (lc(k) === lc(name)) return projects[k] || {};
    return {};
  };

  // ------------------------------------------------------------- data loading

  async function getJSON(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = new Error(`${res.status} ${res.statusText}`);
      err.status = res.status;
      err.rateLimited = res.status === 403 || res.status === 429;
      throw err;
    }
    return res.json();
  }

  const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);

  function pagesUrlFor(r) {
    const o = lc(r.owner.login);
    return lc(r.name) === `${o}.github.io` ? `https://${o}.github.io/` : `https://${o}.github.io/${r.name}/`;
  }

  function includeRepo(r) {
    const c = cfg();
    const k = lc(r.name);
    if (r.private) return false;
    if (r.fork && !c.includeForks) return false;
    if (r.archived && c.includeArchived === false) return false;
    if ((c.exclude || []).map(lc).includes(k)) return false;
    if (k === `${lc(c.username)}.github.io`) return false; // this dashboard
    if (state.hidden.has(k)) return false;
    if (override(r.name).hidden) return false;
    return true;
  }

  /** Minimal project record straight from the GitHub API (used for repos newer than the last build). */
  function fromApi(r) {
    const o = override(r.name);
    const homepage = isUrl(r.homepage) ? r.homepage.trim() : null;
    return {
      name: r.name,
      title: o.title || prettyName(r.name),
      description: o.description || r.description || '',
      longDescription: '',
      category: o.category || cfg().defaultCategory || 'Experiments',
      tags: o.tags || r.topics || [],
      highlights: [],
      featured: (cfg().featured || []).map(lc).includes(lc(r.name)),
      cover: o.cover || null,
      coverSource: o.cover ? 'config' : 'generated',
      hasPages: !!r.has_pages,
      liveUrl: o.live || homepage || (r.has_pages ? pagesUrlFor(r) : null),
      repoUrl: r.html_url,
      language: r.language,
      languages: {},
      stars: r.stargazers_count,
      forks: r.forks_count,
      license: r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : null,
      archived: !!r.archived,
      createdAt: r.created_at,
      updatedAt: r.pushed_at || r.updated_at,
      hasReadme: true,
      readmeUrl: null,
      isNew: true,
    };
  }

  async function fetchRepos(user) {
    const all = [];
    for (let page = 1; page <= 5; page++) {
      const batch = await getJSON(`https://api.github.com/users/${user}/repos?type=owner&sort=pushed&per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      all.push(...batch);
      if (batch.length < 100) break;
    }
    return all;
  }

  async function loadBuilt() {
    try {
      const data = await getJSON('data/projects.json', { cache: 'no-cache' });
      state.user = data.user || null;
      state.generatedAt = data.generatedAt;
      state.hidden = new Set((data.hidden || []).map(lc));
      state.projects = data.projects || [];
      state.fromBuild = new Set(state.projects.map((p) => lc(p.name)));
      state.mode = 'static';
      return true;
    } catch {
      return false;
    }
  }

  /** Reconcile with the live repo list: add new repos, drop deleted/private ones, refresh counts. */
  async function liveSync() {
    let repos;
    try {
      repos = await fetchRepos(cfg().username);
    } catch (err) {
      if (state.mode === 'live') throw err;
      return false; // keep the built data quietly
    }
    const current = new Map(state.projects.map((p) => [lc(p.name), p]));
    let changed = false;
    const next = repos.filter(includeRepo).map((r) => {
      const p = current.get(lc(r.name));
      if (!p) {
        changed = true;
        return fromApi(r);
      }
      const liveUrl = p.liveUrl || (r.has_pages ? pagesUrlFor(r) : null);
      const fresh = {
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.pushed_at || p.updatedAt,
        hasPages: !!r.has_pages,
        liveUrl: !r.has_pages && liveUrl === pagesUrlFor(r) ? null : liveUrl,
      };
      for (const k in fresh) if (p[k] !== fresh[k]) { p[k] = fresh[k]; changed = true; }
      return p;
    });
    if (next.length !== state.projects.length) changed = true;
    state.projects = next;
    if (state.mode === 'live') state.generatedAt = new Date().toISOString();
    return changed;
  }

  // ------------------------------------------------------------- covers

  /** Generated cover art for projects without an image. Uses theme colours, so it follows light/dark. */
  function coverArt(p, withTitle = false) {
    const rnd = seeded(hash(p.name));
    const W = 320, H = 200;
    const cx = 60 + rnd() * 200, cy = 40 + rnd() * 110;
    const lang = langColor(p.language);
    let contours = '';
    const rings = 6 + Math.floor(rnd() * 3);
    const wobble = Array.from({ length: 10 }, () => 0.75 + rnd() * 0.5);
    for (let k = 1; k <= rings; k++) {
      const r = k * (16 + rnd() * 4);
      const pts = wobble.map((w, i) => {
        const a = (i / wobble.length) * Math.PI * 2;
        const rr = r * (1 + (w - 1) * (k / rings));
        return [cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr];
      });
      let d = '';
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[i], p1 = pts[(i + 1) % pts.length];
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
        d += i === 0 ? `M${mx.toFixed(1)},${my.toFixed(1)}` : '';
        const p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
        d += ` Q${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${((p2[0] + p3[0]) / 2).toFixed(1)},${((p2[1] + p3[1]) / 2).toFixed(1)}`;
      }
      contours += `<path d="${d}Z" fill="none" stroke="var(--accent)" stroke-opacity="${(0.55 - k * 0.05).toFixed(2)}" stroke-width="1"/>`;
    }
    let nodes = '';
    const pts = Array.from({ length: 4 }, () => [20 + rnd() * 280, 20 + rnd() * 130]);
    nodes += `<polyline points="${pts.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--muted)" stroke-opacity=".45" stroke-dasharray="3 4"/>`;
    for (const [x, y] of pts) nodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="var(--surface)" stroke="var(--muted)" stroke-width="1.2"/>`;
    const fontSize = Math.max(18, Math.min(34, 520 / Math.max(p.title.length, 8)));
    return `<svg class="cover-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="">
      <defs><pattern id="g${hash(p.name)}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="var(--line)" stroke-width=".6"/></pattern></defs>
      <rect width="${W}" height="${H}" fill="var(--surface-2)"/>
      <rect width="${W}" height="${H}" fill="url(#g${hash(p.name)})" opacity=".8"/>
      ${contours}${nodes}
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="${lang}"/>
      ${withTitle ? `<text x="18" y="${H - 20}" font-family="Saira, var(--font-display)" font-weight="600" font-size="${fontSize.toFixed(0)}" fill="var(--text)" style="font-variation-settings:'wdth' 118" opacity=".9">${esc(p.title)}</text>` : ''}
    </svg>`;
  }

  function coverMarkup(p, eager = false) {
    if (!p.cover) return coverArt(p, eager);
    return `<img src="${esc(p.cover)}" alt="" ${eager ? '' : 'loading="lazy"'} decoding="async" data-cover-for="${esc(p.name)}">`;
  }

  // Broken image -> fall back to generated art.
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.coverFor) return;
      const p = state.projects.find((x) => x.name === img.dataset.coverFor);
      if (p) img.outerHTML = coverArt(p, !!img.closest('.project__cover'));
    },
    true,
  );

  // ------------------------------------------------------------- filtering

  function visibleProjects() {
    const { q, status, category, sort } = state.filters;
    const terms = lc(q).split(/\s+/).filter(Boolean);
    let list = state.projects.filter((p) => {
      if (status === 'live' && !p.liveUrl) return false;
      if (status === 'source' && p.liveUrl) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (!terms.length) return true;
      const hay = lc([p.title, p.name, p.description, p.category, p.language, ...(p.tags || [])].join(' '));
      return terms.every((t) => hay.includes(t));
    });
    const featuredOrder = (cfg().featured || []).map(lc);
    const byUpdated = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
    const sorters = {
      featured: (a, b) => {
        const fa = a.featured ? featuredOrder.indexOf(lc(a.name)) : -1;
        const fb = b.featured ? featuredOrder.indexOf(lc(b.name)) : -1;
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.featured && fa !== fb) return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb);
        return byUpdated(a, b);
      },
      updated: byUpdated,
      created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      name: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
      stars: (a, b) => b.stars - a.stars || byUpdated(a, b),
    };
    return list.sort(sorters[sort] || sorters.featured);
  }

  // ------------------------------------------------------------- dashboard view

  function renderDashboard() {
    const c = cfg();
    const main = $('#main');
    document.title = c.siteTitle || 'Projects';
    main.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div>
          <h1 class="hero__title" id="hero-title">${esc(c.siteTitle || owner())}</h1>
          ${c.tagline ? `<p class="hero__tagline">${esc(c.tagline)}</p>` : ''}
          ${c.intro ? `<p class="hero__intro">${esc(c.intro)}</p>` : ''}
          <ul class="readout" aria-live="polite"></ul>
        </div>
        <div class="orbit"><canvas aria-hidden="true"></canvas></div>
      </section>

      <div class="toolbar" role="search">
        <label class="search">
          <span class="visually-hidden">Search projects</span>
          ${ICON.search}
          <input type="search" placeholder="Search projects" value="${esc(state.filters.q)}" autocomplete="off" spellcheck="false">
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div class="segmented" role="group" aria-label="Filter by status"></div>
        <label class="select"><span class="visually-hidden">Category</span><select data-filter="category"></select></label>
        <label class="select"><span class="visually-hidden">Sort by</span>
          <select data-filter="sort">
            <option value="featured">Featured first</option>
            <option value="updated">Recently updated</option>
            <option value="created">Newest</option>
            <option value="name">Name</option>
            <option value="stars">Most stars</option>
          </select>
        </label>
        <p class="toolbar__count" aria-live="polite"></p>
      </div>

      <section class="grid" aria-label="Projects"></section>`;

    const input = $('.search input', main);
    input.addEventListener('input', () => {
      state.filters.q = input.value;
      renderGrid();
    });
    $('[data-filter="sort"]', main).value = state.filters.sort;
    $$('select[data-filter]', main).forEach((sel) =>
      sel.addEventListener('change', () => {
        state.filters[sel.dataset.filter] = sel.value;
        renderGrid();
      }),
    );
    $('.segmented', main).addEventListener('click', (e) => {
      const b = e.target.closest('button[data-status]');
      if (!b) return;
      state.filters.status = b.dataset.status;
      renderGrid();
    });

    orbit.mount($('.orbit canvas', main));
    updateDashboard();
    requestAnimationFrame(() => window.scrollTo(0, state.dashScroll));
  }

  function updateDashboard() {
    const main = $('#main');
    if (!$('.grid', main)) return;
    const live = state.projects.filter((p) => p.liveUrl).length;
    const total = state.projects.length;

    $('.readout', main).innerHTML = state.loaded
      ? `<li><strong>${total}</strong> projects</li>
         <li><span class="led"></span><strong>${live}</strong> live sites</li>
         <li><span class="led led--off"></span><strong>${total - live}</strong> source only</li>
         ${state.generatedAt ? `<li class="readout__sync">Synced ${esc(relTime(state.generatedAt))}</li>` : ''}`
      : '<li>Connecting to GitHub…</li>';

    $('.segmented', main).innerHTML = [
      ['all', 'All', total],
      ['live', 'Live sites', live],
      ['source', 'Source only', total - live],
    ]
      .map(
        ([v, label, n]) =>
          `<button type="button" data-status="${v}" aria-pressed="${state.filters.status === v}">${label} <span class="count">${state.loaded ? n : ''}</span></button>`,
      )
      .join('');

    const cats = [...new Set(state.projects.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (state.filters.category !== 'all' && !cats.includes(state.filters.category)) state.filters.category = 'all';
    $('[data-filter="category"]', main).innerHTML =
      `<option value="all">All categories</option>` +
      cats.map((c) => `<option ${c === state.filters.category ? 'selected' : ''}>${esc(c)}</option>`).join('');

    orbit.setProjects(state.projects);
    renderGrid();
  }

  function cardMarkup(p, wide) {
    const live = !!p.liveUrl;
    return `<a class="card${wide ? ' card--wide' : ''}" href="#/p/${encodeURIComponent(p.name)}">
      <div class="card__media">
        ${coverMarkup(p)}
        <span class="status"><span class="led${live ? '' : ' led--off'}"></span>${live ? 'Live site' : 'Source only'}</span>
        ${p.isNew && state.mode === 'static' ? '<span class="badge-new">New</span>' : ''}
      </div>
      <div class="card__body">
        <h2 class="card__title">${esc(p.title)}</h2>
        ${
          p.description
            ? `<p class="card__desc">${esc(p.description)}</p>`
            : `<p class="card__desc card__desc--empty">No description yet.</p>`
        }
        ${wide && p.tags?.length ? `<div class="card__tags">${p.tags.slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="card__meta">
          ${p.language ? `<span><span class="lang-dot" style="--c:${langColor(p.language)}"></span>${esc(p.language)}</span>` : ''}
          ${p.stars ? `<span>${ICON.star}${p.stars}<span class="visually-hidden"> stars</span></span>` : ''}
          <span class="time">Updated ${esc(relTime(p.updatedAt))}</span>
        </div>
      </div>
    </a>`;
  }

  function renderGrid() {
    const main = $('#main');
    const grid = $('.grid', main);
    if (!grid) return;
    $$('.segmented button', main).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.status === state.filters.status)));

    if (!state.loaded) {
      grid.innerHTML = Array.from(
        { length: 6 },
        () =>
          `<div class="card skeleton" aria-hidden="true"><div class="card__media"></div><div class="card__body"><div class="bar" style="width:55%"></div><div class="bar"></div><div class="bar" style="width:80%"></div></div></div>`,
      ).join('');
      $('.toolbar__count', main).textContent = '';
      return;
    }

    const list = visibleProjects();
    const f = state.filters;
    const pristine = !f.q && f.status === 'all' && f.category === 'all' && f.sort === 'featured';
    $('.toolbar__count', main).textContent =
      list.length === state.projects.length ? `${list.length} projects` : `${list.length} of ${state.projects.length} projects`;

    if (!list.length) {
      grid.innerHTML = `<div class="empty">
        <p>${state.projects.length ? `No projects match${f.q ? ` “${esc(f.q)}”` : ' these filters'}.` : 'No public repositories yet.'}</p>
        ${state.projects.length ? '<button class="btn btn--small" type="button" data-clear>Clear filters</button>' : ''}
      </div>`;
      $('[data-clear]', grid)?.addEventListener('click', () => {
        state.filters = { q: '', status: 'all', category: 'all', sort: f.sort };
        renderDashboard();
      });
      return;
    }
    grid.innerHTML = list.map((p) => cardMarkup(p, pristine && p.featured)).join('');
  }

  // ------------------------------------------------------------- project view

  function renderProject(name) {
    const main = $('#main');
    const p = state.projects.find((x) => lc(x.name) === lc(name));

    if (!p) {
      if (!state.loaded) {
        main.innerHTML = '<div class="boot">Loading project…</div>';
        return;
      }
      document.title = `Not found | ${cfg().siteTitle || ''}`;
      main.innerHTML = `<div class="error-panel">
        <h1>There’s no public project called “${esc(name)}”</h1>
        <p>It may have been renamed, made private or deleted.</p>
        <a class="btn" href="#/">${ICON.back} All projects</a>
      </div>`;
      return;
    }

    document.title = `${p.title} | ${cfg().siteTitle || owner()}`;
    const live = !!p.liveUrl;
    const list = visibleProjects();
    const idx = list.findIndex((x) => x.name === p.name);
    const prev = idx > 0 ? list[idx - 1] : null;
    const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

    const langs = Object.entries(p.languages || {});
    const total = langs.reduce((s, [, n]) => s + n, 0);
    const langRows = total
      ? langs.sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l, n]) => [l, (n / total) * 100])
      : p.language
        ? [[p.language, 100]]
        : [];

    const liveHost = live ? p.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

    main.innerHTML = `
      <article class="project">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">${ICON.back} All projects</a></nav>

        <header class="project__head">
          <div>
            <h1 class="project__title">${esc(p.title)}</h1>
            ${p.description ? `<p class="project__lede">${esc(p.description)}</p>` : '<p class="project__lede" data-lede hidden></p>'}
            <div class="project__chips">
              <span class="chip${live ? ' chip--live' : ''}"><span class="led${live ? '' : ' led--off'}"></span>${live ? 'Live site' : 'Source only'}</span>
              ${p.category ? `<span class="chip">${esc(p.category)}</span>` : ''}
              ${p.archived ? '<span class="chip">Archived</span>' : ''}
            </div>
            <div class="actions">
              ${live ? `<a class="btn btn--primary" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${ICON.external} Open live site</a>` : ''}
              <a class="btn" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${ICON.github} View source</a>
            </div>
          </div>
          <div class="project__cover">${coverMarkup(p, true)}</div>
        </header>

        <div class="project__body">
          <div>
            ${p.longDescription ? `<p class="project__lede">${esc(p.longDescription)}</p>` : ''}
            <div class="markdown-body" data-readme>
              <div class="skeleton" aria-hidden="true">
                <div class="bar" style="width:40%;height:1.4rem;margin-bottom:1rem"></div>
                <div class="bar" style="margin-bottom:.6rem"></div><div class="bar" style="width:92%;margin-bottom:.6rem"></div><div class="bar" style="width:70%"></div>
              </div>
            </div>
          </div>

          <aside class="specs" aria-label="Project details">
            <section>
              <h2>Status</h2>
              <div class="status-line">
                <span class="led${live ? '' : ' led--off'}"></span>
                <p>${
                  live
                    ? `Live at <a href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${esc(liveHost)}</a>`
                    : 'Source only<small>This project doesn’t have a GitHub Pages site.</small>'
                }</p>
              </div>
            </section>
            ${
              langRows.length
                ? `<section><h2>Languages</h2>
                    <div class="langbar" aria-hidden="true">${langRows.map(([l, pct]) => `<span style="--c:${langColor(l)};flex:${pct.toFixed(2)}"></span>`).join('')}</div>
                    <ul class="langlist">${langRows
                      .map(([l, pct]) => `<li><span class="lang-dot" style="--c:${langColor(l)}"></span>${esc(l)}<span class="pct">${pct < 0.1 ? '<0.1' : pct.toFixed(1)}%</span></li>`)
                      .join('')}</ul></section>`
                : ''
            }
            <section>
              <h2>Details</h2>
              <dl>
                <dt>Created</dt><dd>${esc(fmtDate(p.createdAt))}</dd>
                <dt>Last update</dt><dd>${esc(fmtDate(p.updatedAt))}</dd>
                <dt>Stars</dt><dd>${p.stars ?? 0}</dd>
                <dt>Forks</dt><dd>${p.forks ?? 0}</dd>
                ${p.license ? `<dt>License</dt><dd>${esc(p.license)}</dd>` : ''}
                <dt>Repository</dt><dd><a href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${esc(p.name)}</a></dd>
              </dl>
            </section>
            ${p.tags?.length ? `<section><h2>Tags</h2><div class="tags">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></section>` : ''}
            ${p.highlights?.length ? `<section><h2>Highlights</h2><ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>` : ''}
          </aside>
        </div>

        ${
          prev || next
            ? `<nav class="pager" aria-label="More projects">
                ${prev ? `<a class="prev" href="#/p/${encodeURIComponent(prev.name)}"><span>Previous</span><strong>${esc(prev.title)}</strong></a>` : ''}
                ${next ? `<a class="next" href="#/p/${encodeURIComponent(next.name)}"><span>Next</span><strong>${esc(next.title)}</strong></a>` : ''}
              </nav>`
            : ''
        }
      </article>`;

    window.scrollTo(0, 0);
    loadReadme(p);
  }

  // README: built copy first, GitHub API as fallback.
  function resolverFor(p) {
    const [, o, r] = p.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
    return (url, kind) => {
      if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
      const clean = url.replace(/^\.?\//, '');
      return kind === 'src'
        ? `https://raw.githubusercontent.com/${o}/${r}/HEAD/${clean}`
        : `https://github.com/${o}/${r}/blob/HEAD/${clean}`;
    };
  }
  function rewriteHtml(html, resolve) {
    return html
      .replace(/(<(?:img|source|video)\b[^>]*?\s(?:src|poster))=(["'])(.*?)\2/gi, (_, pre, q, u) => `${pre}=${q}${resolve(u, 'src')}${q}`)
      .replace(/(<a\b[^>]*?\shref)=(["'])(.*?)\2/gi, (_, pre, q, u) => `${pre}=${q}${resolve(u, 'href')}${q}`);
  }

  async function fetchReadme(p) {
    const key = lc(p.name);
    if (state.readmes.has(key)) return state.readmes.get(key);
    let html = null;
    if (state.fromBuild.has(key) && p.hasReadme) {
      try {
        const res = await fetch(`data/readme/${encodeURIComponent(key)}.html`);
        if (res.ok) html = await res.text();
      } catch {}
    }
    if (html === null && p.hasReadme !== false) {
      try {
        const [, o, r] = p.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        const res = await fetch(`https://api.github.com/repos/${o}/${r}/readme`, {
          headers: { Accept: 'application/vnd.github.html+json' },
        });
        if (res.ok) html = rewriteHtml(await res.text(), resolverFor(p));
        else if (res.status !== 404) html = undefined; // temporary failure
      } catch {
        html = undefined;
      }
    }
    if (html !== undefined) state.readmes.set(key, html);
    return html;
  }

  async function loadReadme(p) {
    const box = $('[data-readme]');
    const html = await fetchReadme(p);
    if (!box.isConnected) return;
    if (html) {
      box.innerHTML = html;
      const squash = (t) => lc(t).replace(/[^a-z0-9]/g, '');
      const h1 = box.querySelector('h1');
      const firstBlock = box.querySelector('article > *, .markdown-body > *:not(article)');
      if (h1 && (firstBlock === h1 || firstBlock?.contains(h1)) && [squash(p.title), squash(p.name)].includes(squash(h1.textContent))) {
        (h1.closest('.markdown-heading') || h1).remove();
      }
      const lede = $('[data-lede]');
      if (lede) {
        const firstP = [...box.querySelectorAll('p')].map((x) => x.textContent.trim()).find((t) => t.length > 40);
        if (firstP) {
          lede.textContent = firstP.length > 260 ? firstP.slice(0, 257).replace(/\s+\S*$/, '') + '…' : firstP;
          lede.hidden = false;
        }
      }
    } else if (html === null) {
      box.innerHTML = `<div class="notice"><p>This project doesn’t have a README yet.</p><p><a href="${esc(p.repoUrl)}" target="_blank" rel="noopener">Browse the files on GitHub</a></p></div>`;
    } else {
      box.innerHTML = `<div class="notice"><p>The README couldn’t be loaded from GitHub right now. GitHub limits anonymous requests to 60 an hour, so try again shortly.</p><p><a href="${esc(p.repoUrl)}#readme" target="_blank" rel="noopener">Read it on GitHub</a></p></div>`;
    }
  }

  // In-README links like #install would clash with the hash router, so scroll instead.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-readme] a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = document.getElementById(id) || document.getElementById(`user-content-${id}`);
    target?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });

  // ------------------------------------------------------------- orbit (hero visual)

  const orbit = (() => {
    let canvas, ctx, nodes = [], raf = 0, start = 0, hover = null, colors = {}, size = 0, visible = true, observer;
    const tip = $('.orbit-tip');

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      for (const k of ['line', 'line-strong', 'muted', 'accent', 'live', 'surface', 'text', 'bg']) colors[k] = cs.getPropertyValue(`--${k}`).trim();
    }

    function setProjects(list) {
      const sorted = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const n = sorted.length;
      nodes = sorted.map((p, i) => {
        const ring = n < 4 ? 2 : Math.min(2, Math.floor((i / n) * 3));
        const h = hash(p.name);
        return { p, ring, angle: ((h % 3600) / 3600) * Math.PI * 2, order: i, x: 0, y: 0, phase: (h % 1000) / 1000 };
      });
      // spread nodes on the same ring that land too close together
      for (let r = 0; r < 3; r++) {
        const on = nodes.filter((nd) => nd.ring === r).sort((a, b) => a.angle - b.angle);
        const min = (Math.PI * 2) / Math.max(on.length * 1.6, 12);
        for (let i = 1; i < on.length; i++) if (on[i].angle - on[i - 1].angle < min) on[i].angle = on[i - 1].angle + min;
      }
      if (!raf) draw(performance.now());
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) draw(performance.now());
    }

    function draw(now) {
      raf = 0;
      if (!canvas?.isConnected || !size) return;
      const still = reducedMotion.matches;
      const t = (now - start) / 1000;
      const intro = still ? 1 : Math.min(1, t / 1.6);
      const ease = 1 - Math.pow(1 - intro, 3);
      const c = size / 2;
      const R = c - 16;
      const radii = [R * 0.4, R * 0.67, R * 0.94];
      const speed = [0.035, 0.022, 0.014];
      ctx.clearRect(0, 0, size, size);

      // dial ticks
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      for (let i = 0; i < 120; i++) {
        if (i / 120 > ease) break;
        const a = (i / 120) * Math.PI * 2 - Math.PI / 2;
        const long = i % 10 === 0;
        const r1 = R + 4, r2 = R + (long ? 13 : 8);
        ctx.globalAlpha = long ? 0.9 : 0.5;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
        ctx.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // rings
      radii.forEach((r, i) => {
        ctx.strokeStyle = i === 2 ? colors['line-strong'] : colors.line;
        ctx.setLineDash(i === 1 ? [2, 5] : []);
        ctx.beginPath();
        ctx.arc(c, c, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // crosshair + core
      ctx.strokeStyle = colors.line;
      ctx.globalAlpha = 0.6 * ease;
      ctx.beginPath();
      ctx.moveTo(c - R * 0.25, c); ctx.lineTo(c + R * 0.25, c);
      ctx.moveTo(c, c - R * 0.25); ctx.lineTo(c, c + R * 0.25);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(c, c, 5, 0, Math.PI * 2);
      ctx.fill();
      if (!still) {
        const pr = (t % 3) / 3;
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = (1 - pr) * 0.6;
        ctx.beginPath();
        ctx.arc(c, c, 5 + pr * radii[0] * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // nodes
      const n = nodes.length;
      for (const nd of nodes) {
        const appear = still ? 1 : Math.max(0, Math.min(1, (t - 0.5 - (nd.order / Math.max(n, 1)) * 1.2) / 0.35));
        if (appear <= 0) continue;
        const a = nd.angle + (still ? 0 : t * speed[nd.ring]);
        nd.x = c + Math.cos(a) * radii[nd.ring];
        nd.y = c + Math.sin(a) * radii[nd.ring];
        const live = !!nd.p.liveUrl;
        const isHover = hover === nd;
        const r = (nd.p.featured ? 6 : 4.5) * (isHover ? 1.35 : 1) * appear;

        if (live && !still) {
          const pr = ((t * 0.5 + nd.phase) % 1);
          ctx.fillStyle = colors.live;
          ctx.globalAlpha = (1 - pr) * 0.28;
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, r + pr * 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
        if (live) {
          ctx.fillStyle = colors.live;
          ctx.fill();
        } else {
          ctx.fillStyle = colors.bg;
          ctx.fill();
          ctx.strokeStyle = colors.muted;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        if (isHover) {
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, r + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(c, c);
          ctx.lineTo(nd.x, nd.y);
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.lineWidth = 1;

      if (hover) placeTip();
      const animating = !still || intro < 1;
      if (animating && visible && !document.hidden) raf = requestAnimationFrame(draw);
    }

    function placeTip() {
      const rect = canvas.getBoundingClientRect();
      tip.style.left = `${rect.left + hover.x}px`;
      tip.style.top = `${rect.top + hover.y}px`;
    }

    function nodeAt(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      let best = null, bd = 18 * 18;
      for (const nd of nodes) {
        const d = (nd.x - x) ** 2 + (nd.y - y) ** 2;
        if (d < bd) { bd = d; best = nd; }
      }
      return best;
    }

    function onMove(e) {
      const nd = nodeAt(e);
      if (nd === hover) return;
      hover = nd;
      canvas.style.cursor = nd ? 'pointer' : 'default';
      if (nd) {
        tip.innerHTML = `<strong>${esc(nd.p.title)}</strong>${nd.p.liveUrl ? 'Live site' : 'Source only'}`;
        tip.hidden = false;
        placeTip();
      } else tip.hidden = true;
      if (!raf) draw(performance.now());
    }
    function onLeave() {
      hover = null;
      tip.hidden = true;
      if (!raf) draw(performance.now());
    }
    function onClick(e) {
      const nd = nodeAt(e);
      if (nd) location.hash = `#/p/${encodeURIComponent(nd.p.name)}`;
    }

    function wake() {
      if (!raf && canvas?.isConnected) raf = requestAnimationFrame(draw);
    }

    function mount(el) {
      canvas = el;
      ctx = canvas.getContext('2d');
      start = performance.now();
      hover = null;
      tip.hidden = true;
      readColors();
      new ResizeObserver(resize).observe(canvas);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('click', onClick);
      observer?.disconnect();
      observer = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible) wake();
      });
      observer.observe(canvas);
      resize();
    }

    document.addEventListener('visibilitychange', wake);
    return {
      mount,
      setProjects,
      refreshColors() {
        readColors();
        if (!raf && canvas?.isConnected) draw(performance.now());
      },
      hideTip() { tip.hidden = true; },
    };
  })();

  // ------------------------------------------------------------- theme

  const themeBtn = $('.theme-toggle');
  const themeLabels = { system: 'Auto', light: 'Light', dark: 'Dark' };
  function applyTheme(mode) {
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    themeBtn.dataset.mode = mode;
    themeBtn.setAttribute('aria-label', `Theme: ${mode === 'system' ? 'match system' : mode}. Change theme`);
    $('.theme-toggle__label', themeBtn).textContent = themeLabels[mode];
    orbit.refreshColors();
  }
  let themeMode = 'system';
  try {
    themeMode = localStorage.getItem('theme') || 'system';
  } catch {}
  applyTheme(themeMode);
  themeBtn.addEventListener('click', () => {
    themeMode = { system: 'light', light: 'dark', dark: 'system' }[themeMode] || 'system';
    try {
      if (themeMode === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', themeMode);
    } catch {}
    applyTheme(themeMode);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => orbit.refreshColors());

  // ------------------------------------------------------------- routing

  let currentView = null;
  function route() {
    const m = location.hash.match(/^#\/p\/(.+)$/);
    orbit.hideTip();
    if (currentView === 'dashboard') state.dashScroll = window.scrollY;
    if (state.loadError && !state.projects.length) return renderError();
    if (m) {
      currentView = 'project';
      renderProject(decodeURIComponent(m[1]));
    } else {
      currentView = 'dashboard';
      renderDashboard();
    }
    $$('.topnav [data-nav]').forEach((a) => a.toggleAttribute('aria-current', currentView === 'dashboard'));
    if (m) $('#main').focus({ preventScroll: true });
  }

  function rerender() {
    if (currentView === 'dashboard') updateDashboard();
    else if (currentView === 'project') {
      const m = location.hash.match(/^#\/p\/(.+)$/);
      const shown = $('.project__title');
      if (!shown && m) renderProject(decodeURIComponent(m[1]));
    }
    updateFooter();
  }

  function renderError() {
    const err = state.loadError;
    $('#main').innerHTML = `<div class="error-panel">
      <h1>Projects couldn’t be loaded</h1>
      <p>${
        err?.rateLimited
          ? 'GitHub limits anonymous requests to 60 an hour per network, and that limit has been reached. Try again in a little while.'
          : 'GitHub didn’t respond. Check your connection and reload the page.'
      }</p>
      <button class="btn" type="button" onclick="location.reload()">Reload</button>
    </div>`;
  }

  function updateFooter() {
    const note = $('[data-sync-note]');
    if (state.generatedAt) note.textContent = `Synced with GitHub ${relTime(state.generatedAt)}.`;
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const input = $('.search input');
    if (input) {
      e.preventDefault();
      input.focus();
    }
  });

  // ------------------------------------------------------------- boot

  async function boot() {
    try {
      state.config = await getJSON('dashboard.config.json', { cache: 'no-cache' });
    } catch {
      state.config = { username: 'DVExperiments', siteTitle: 'DV Experiments' };
    }
    const c = cfg();
    $$('[data-site-title]').forEach((el) => (el.textContent = c.siteTitle || c.username));
    $$('[data-profile-link]').forEach((a) => (a.href = `https://github.com/${c.username}`));

    const built = await loadBuilt();
    if (built) {
      state.loaded = true;
      route();
      updateFooter();
      if (await liveSync()) rerender();
    } else {
      state.mode = 'live';
      route();
      try {
        await liveSync();
        state.loaded = true;
      } catch (err) {
        state.loadError = err;
        state.loaded = true;
        renderError();
        return;
      }
      rerender();
    }
  }

  boot();
})();
