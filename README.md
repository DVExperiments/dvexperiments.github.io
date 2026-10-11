# DV Experiments · GitHub Pages hub

A free, static, responsive project hub for [DVExperiments](https://github.com/DVExperiments). Designed as an experimental software gallery with individual project pages.

**Site address after publishing:** `https://dvexperiments.github.io/`

## Features

- Searchable gallery with category filters (Simulations / Tools / Games) and availability filters.
- Data-driven project detail pages at `project.html?slug=YOUR-PROJECT`, so no duplicate hand-coded pages.
- Clearly distinguished **Live online**, **On GitHub** and **In development** statuses.
- Featured project, live-lab section, random project button, related projects, and light/dark theme toggle.
- Accessible semantic HTML, keyboard-friendly controls, reduced-motion support, and responsive layouts.
- No framework, build pipeline, npm packages, tracking, backend, external fonts, or paid services.
- Custom SVG concept artwork (not screenshots). Replace these with your own screenshots whenever you like.

## Publish on GitHub Pages

1. Sign into the GitHub account `DVExperiments`.
2. Create a **public** repository with the exact name **`dvexperiments.github.io`**. Do not put these files into `Little-Worlds-NZ`; this is a separate central hub.
3. Upload the **contents** of this folder to the repository root (especially `index.html`, `project.html`, `assets/`, `favicon.svg`, and `.nojekyll`). **Do not upload the containing folder as one nested directory.** If GitHub offers to initialise the repo with its own README, you may leave that box unchecked.
4. Navigate to **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, then `main` and `/(root)`, and save.
5. When GitHub finishes publishing, visit `https://dvexperiments.github.io/`.

To upload with Git locally instead:

```bash
git init
git add .
git commit -m "Launch DV Experiments project hub"
git branch -M main
git remote add origin https://github.com/DVExperiments/dvexperiments.github.io.git
git push -u origin main
```

The repo must be created on GitHub before you push using that sequence. You only need to enable Pages once.

## Preview it on your computer

Option A: Double-click `index.html`. The site has no network or package dependencies.

Option B: From inside the site directory, run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000/>. The second option better mirrors Pages hosting.

## Add or update a project

Edit **`assets/projects.js`**. Each object is a project card + detailed page. Copy one object, give it a unique `slug`, fill in the title, description, features and optionally publication URLs. A project marked `development` with no URL will not get a broken launch button.

See [docs/ADDING_A_PROJECT.md](docs/ADDING_A_PROJECT.md) for a field-by-field guide and a copy-paste sample.

**New project links:**

- `https://dvexperiments.github.io/project.html?slug=your-slug` for its detail page.
- Any valid, published external GitHub Pages URL in `liveUrl` for its playable experience.
- A public GitHub repository URL in `repoUrl` for its code page.

When you publish Spaceport 07, GameSignal, Pocket Pal or another project, add their real URL(s) to `assets/projects.js` and change `status` to `live` or `repository` as appropriate.

## Current launch availability

| Project | Listed state | Link |
| --- | --- | --- |
| Little Worlds | Published browser experience (link previously reported working) | [Play](https://dvexperiments.github.io/Little-Worlds-NZ/) / [Repository](https://github.com/DVExperiments/Little-Worlds-NZ) |
| NZ EcoSim | Public repository; desktop app | [Repository](https://github.com/DVExperiments/nz-ecosim) |
| Spaceport 07 | In development | No public destination set |
| GameSignal | In development | No public destination set |
| Pocket Pal | In development / concept | No public destination set |

The website intentionally does **not** claim desktop Python programs run inside GitHub Pages. Publishing a separate browser port requires browser-compatible HTML/CSS/JavaScript or a separately hosted runtime.

## Design & maintenance

- **Content:** `assets/projects.js`
- **Homepage:** `index.html`
- **Reusable detail page:** `project.html`
- **Layout and colours:** `assets/styles.css` — CSS custom properties at the top
- **Search, filters, themes, cards:** `assets/site.js`
- **Artwork:** `assets/cover-*.svg`
- **Optional artwork generator:** `make_art.py` — Python 3 standard library only; it is not needed to run the website
- **Fallback:** `404.html`

Do not place confidential details in these public site files. No contact form, server processing, or visitor analytics is configured.

## Project info is hand-curated

This first version deliberately does not call the GitHub API. Updating it is simple and reliable; repositories do not automatically appear unless you add them. If you want future automatic repository discovery, you could add an opt-in GitHub API integration (with care around rate limits, card copy, and work-in-progress filtering).

## License

This package is a starter website intended for its owner's GitHub hub. No third-party libraries or commercial assets are included. The illustrative SVG artwork was generated for this package and is replaceable.
