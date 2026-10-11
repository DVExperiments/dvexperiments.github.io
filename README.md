# DV Experiments — GitHub Pages Hub v1.1

An independent creative-tech portfolio and experimental software library built with plain HTML, CSS and JavaScript. Free to host on GitHub Pages, without a build step or a database.

## What's new in v1.1?

- Discovers the account's **public GitHub repositories** automatically at each site visit.
- Uses GitHub's **`has_pages` flag** to distinguish *Live online* from *On GitHub*.
- Reads an optional **`dv-project.json`** from the root of each project repository for descriptions, features, tags, links and cover images.
- Automatically adds a new public repository to the gallery with a working detail page and filters.
- Retains manually drafted/unpublished concepts and fallback data if the GitHub API is unavailable.
- The featured Live Lab description and image can reflect per-repo project metadata.

## Installation

1. Create the **public** GitHub repository `dvexperiments.github.io` (or use your existing one).
2. Upload **the files and folders inside this ZIP** into the repository root, including `.nojekyll`, `index.html`, `assets/` and `project.html`. Replace old v1.0 files with the updated versions.
3. Under repository **Settings → Pages**, select **Deploy from a branch**, `main`, `/(root)`.
4. Open `https://dvexperiments.github.io/` after Pages deploys.

The `.nojekyll` empty file is useful for ensuring `/.github/` paths and other filenames are not filtered by Jekyll. It must remain at the root.

## Add or edit project descriptions (most important)

Open the **project's own repository**, create a root-level `dv-project.json` on its default branch, paste `examples/dv-project.json` and replace the example text with accurate information. Commit the file. The hub reads it automatically. Full guide: [`docs/PROJECT_METADATA.md`](docs/PROJECT_METADATA.md).

The files in `examples/` are templates only: they are not read by the website, and the example descriptions intentionally contain placeholders. Editing an example in the hub does **not** edit the individual project repo.

## Status logic

**Live online:** public repository with GitHub Pages enabled. **On GitHub:** public repository without Pages. **In development:** manually curated unpublished concept. **Private:** excluded from public discovery. This determines availability, not the completeness or quality of a project.

## Editing the hub itself

| Task | Edit |
|---|---|
| Project descriptions/features once metadata file exists | `dv-project.json` **inside that project's repository** |
| Homepage, headings, About wording | `index.html` |
| Colours, type, layout | `assets/styles.css` |
| Unpublished/placeholder projects and backup images | `assets/projects.js` |
| Hide public repos globally | `window.DV_HIDDEN_REPOS` in `assets/projects.js` |
| GitHub discovery code | `assets/project-sync.js` (advanced) |

For exact steps, see [`docs/ADDING_A_PROJECT.md`](docs/ADDING_A_PROJECT.md).

## Design and technical notes

- No external fonts, tracking scripts, user accounts, build tools or paid dependencies.
- Remote Github data is escaped before insertion into page HTML.
- Browser requests only public data; no tokens, private repository access, or Actions workflow needed.
- The site initially draws its saved catalogue quickly, then replaces it with public GitHub data. Changes to GitHub's API or rate limits can prevent refreshing; fallback continues to work.
- The GitHub Pages enabled flag is **not** a site uptime check; some Pages sites host documentation instead of apps.
- Public GitHub API traffic has an anonymous per-IP quota. Consider a scheduled, prebuilt catalogue if the project grows substantially.
- Site and project links work independently: a broken published site does not prevent visiting its source repository.

© 2026 DV Experiments.
