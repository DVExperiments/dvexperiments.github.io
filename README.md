# DV Experiments dashboard

A dashboard of every public repository on the DVExperiments GitHub account. Each project gets a panel showing whether it has a live GitHub Pages site, and an about page built from its README with links to the live site and the source.

It updates itself: a GitHub Action rebuilds the data every hour, and every visit also checks GitHub for repos created since the last build, so a new public repo shows up immediately.

## Setting it up

1. **Free up the name.** Open the old `dvexperiments.github.io` repo, go to Settings, and rename it (for example to `dashboard-v1`). If you'd rather it didn't appear on the new dashboard, add its new name to `"exclude"` in `dashboard.config.json`, or archive/delete it. You may also want to turn off Pages on it.
2. **Create the new repo.** Make a new **public** repository named exactly `dvexperiments.github.io`.
3. **Upload these files**, keeping the folder structure. Make sure the hidden `.github` folder comes along (on Windows or macOS it may be hidden in your file browser; GitHub Desktop or "Add file > Upload files" with the folder dragged in both work).
4. **Turn on Pages.** Settings > Pages > Build and deployment > Source: **GitHub Actions**.
5. **Run the first build.** Actions tab > "Build and deploy dashboard" > Run workflow. It takes about a minute. (If the upload already triggered a run that failed because Pages wasn't switched on yet, just re-run it.)
6. Visit https://dvexperiments.github.io/

Old links of the form `project.html?repo=name` are redirected to the new project pages.

## How each project's details are found

You never *have* to add anything to a project. Everything is read from GitHub, and you can step in at whichever level is most convenient. Higher in each list wins.

**Cover image**
1. `cover` for that repo in `dashboard.config.json`
2. An image in this repo's `covers/` folder named after the repo, e.g. `covers/glacial.png`
3. A `cover:` line in the project README's dashboard marker (see below)
4. `cover` in the project's `dv-project.json` (your existing files keep working)
5. The repo's **social preview image** (project repo > Settings > General > Social preview > Edit)
6. The first non-badge image in the project's README
7. Generated artwork, unique to each project

**Short description** (shown on the panel and at the top of the about page)
1. `description` in `dashboard.config.json`
2. A `description:` line in the README marker
3. `tagline` or `description` in `dv-project.json`
4. The repo's **About** text (the gear icon next to "About" on the repo's GitHub page)
5. The first real paragraph of the README (version notes and install steps are skipped)

**Title** comes from the same places (`title:`), then the README's top heading if it matches the repo name, then the repo name tidied up.

**About page** shows the full README, rendered by GitHub, with images and links fixed up.

**Live site** is the repo's Pages site if Pages is enabled. If the repo has a Website set in its About box, that URL is used instead.

### The README marker

Add an HTML comment anywhere in a project's README. GitHub doesn't display comments, so it's invisible there:

```markdown
<!-- dashboard
title: NZ EcoSim
description: Build an island. Watch an ecosystem change. Discover the consequences.
cover: docs/cover.png
category: Simulations & Worlds
tags: simulation, ecology, python
featured: true
hide: false
-->
```

Every line is optional. `cover` can be a path inside that repo or a full URL. `hide: true` keeps the repo off the dashboard.

## dashboard.config.json

| Key | What it does |
|---|---|
| `username` | The GitHub account to list |
| `siteTitle`, `tagline`, `intro` | Text at the top of the dashboard |
| `featured` | Repos shown first, as wide panels, in this order |
| `exclude` | Repos never shown (this dashboard repo is always excluded) |
| `includeForks` | Show forked repos (default `false`) |
| `includeArchived` | Show archived repos (default `true`) |
| `defaultCategory` | Category for repos that don't set one |
| `projects` | Per-repo overrides: `title`, `description`, `cover`, `category`, `tags`, `live`, `hidden` |

Repo names in the config aren't case-sensitive. Edits to the config (and to `covers/`) deploy as soon as you commit them.

## When things update

| Change | Shows up |
|---|---|
| New public repo | Immediately, with basic info. Full details (README, cover, languages) after the next hourly build |
| README, About text, social preview, Pages turned on/off | Next hourly build |
| `dashboard.config.json` or `covers/` | A minute or two after you commit |

To update right away, run the workflow from the Actions tab.

GitHub pauses scheduled workflows in repos that have had no commits for 60 days. If that happens you'll get an email; re-enable it from the Actions tab (new repos still appear through the live check in the meantime).

## Previewing locally

```bash
node scripts/build-data.mjs          # needs Node 18+; set GITHUB_TOKEN to avoid the 60 calls/hour limit
python3 -m http.server 8000          # then open http://localhost:8000
```

Without `data/` the site still runs, fetching everything straight from the GitHub API.

## Files

```
index.html               page shell
assets/app.css           styles; colour tokens for light and dark at the top
assets/app.js            dashboard, about pages, live check, theme toggle
dashboard.config.json    your settings and overrides
covers/                  cover images named after repos
scripts/build-data.mjs   collects data from GitHub (run by the Action)
.github/workflows/       hourly build and deploy
project.html, 404.html   redirects for old and mistyped links
```
