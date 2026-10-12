# Project metadata: edit each description in its own repository

## The simple workflow

1. Open your public project repository on GitHub (e.g. `DVExperiments/nz-ecosim`).
2. Choose **Add file → Create new file** and name it exactly `dv-project.json` (lowercase), in the **repository root**.
3. Paste the contents of `examples/dv-project.json` from this hub's repo, then replace the example text with *accurate* project details.
4. **Commit changes** to the repository's **default branch** (often `main`).
5. Reload your DV Experiments website. The hub discovers public repositories using GitHub's API, reads each `dv-project.json` from its default branch, and updates the gallery and detail page.

Do **not** copy the `examples/` folder into every repo. The file belongs at the root of each *project* repo. The examples in this ZIP are guides, **not accurate descriptions** of your software.

## Sample `dv-project.json`

```json
{
  "title": "Example Game",
  "tagline": "A small game about surprising decisions.",
  "description": "An accurate two-sentence summary of what someone will find.",
  "category": "Games",
  "platform": "Browser / JavaScript",
  "overview": ["Why I made this game.", "How it actually works."],
  "highlights": ["One real feature", "Another real feature"],
  "tags": ["Browser", "Game"],
  "featured": false,
  "visible": true
}
```

JSON rules: every key and text value uses double quotes, entries are separated by commas, and there is **no trailing comma** after the final item. GitHub can edit this plain-text file in the browser. Test it in a JSON validator if unsure.

## Recognized fields

| Field | Type | Notes |
|---|---|---|
| `title` | text | Shown on project cards and detail pages. |
| `tagline` | text | Short introduction; also used as the featured Live Lab headline. |
| `description` | text | Used in card body, project page and Live Lab summary. |
| `category` | text | `Games`, `Simulations`, `Tools`, or a new category of your choice. Filters add new categories automatically. |
| `platform` | text | `Browser`, `Python / Desktop`, etc. |
| `year` | text | Displayed on project detail page. |
| `overview` | list of texts | Details under *About the experiment*. |
| `highlights` | list of texts | Bullets under *Things to explore*. |
| `tags` | list of texts | Tags and search keywords. |
| `cover` | text | Optional path **relative to your project repo** such as `assets/cover.png`, or full HTTPS image URL. If absent, hub artwork is used. |
| `imageAlt` | text | Accessible description of the cover. |
| `featured` | boolean | Legacy catalogue priority hint; the homepage hero/Live Lab is pinned to NZ EcoSim in `assets/site.js`. |
| `embed` | boolean | Set `true` for a **browser-playable** GitHub Pages project to include it in the Live Lab chooser. Never enable for documentation-only sites. |
| `visible` | boolean | `false` to exclude this public repository from the hub. |
| `liveUrl` | HTTPS URL | Optional override, e.g. for a custom domain. Used **only** when GitHub Pages is enabled. |
| `notice` | text | Optional availability note. |

Optional files are safe: if `dv-project.json` doesn't exist, the hub uses GitHub's repository description, topics, language, and default artwork. Detailed overviews are not invented.

## How status is determined

- **Live online** means GitHub reports Pages enabled (`has_pages`), regardless of the JSON file.
- **On GitHub** means publicly visible, but GitHub Pages is *not* enabled.
- **In development** is for manually curated project concepts not yet published on GitHub.
- **Private** repositories cannot be discovered using the public API and are not included automatically.

**Important:** `has_pages` means Pages has been *enabled*; it is not a live uptime/health check. The site may still be building or could be documentation, not a playable browser app. The Launch button links to the Pages site URL returned by GitHub's Pages API when available.

## When changes appear

Your Pages hub fetches public repository metadata on each visit. A new public repo appears without updating `assets/projects.js`; updates to `dv-project.json` are picked up on subsequent visits (subject to GitHub/CDN caching). No GitHub Actions, PAT or secrets are required.

GitHub's public REST API has an **unauthenticated rate limit (usually 60 requests/hour per originating IP)**. If a visitor is rate limited, offline or GitHub is unavailable, the site keeps showing the saved entries from `assets/projects.js`. Once requests work again, it refreshes. For large volumes of traffic or repos, a pre-generated catalogue via GitHub Actions would be more reliable.

## What is still edited in the hub repository?

- `index.html`: introductory homepage wording, navigation and About section.
- `assets/styles.css`: fonts, colors and layout.
- `assets/projects.js`: manually curated unpublished projects and built-in fallback artwork; optional `DV_HIDDEN_REPOS` list to hide a public repo globally.
- `assets/project-sync.js`: GitHub discovery logic; normally no changes needed.

Do not put tokens, passwords or private content in project JSON files: the repository is publicly accessible.
