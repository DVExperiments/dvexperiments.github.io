# Add or edit a project in DV Experiments v1.1

## New public GitHub repository

You do not need to edit the hub. Simply publish the new repository. The hub discovers it automatically and shows it as **On GitHub**. Enabling **Settings → Pages** for that project switches the badge to **Live online** once GitHub's API reports Pages enabled.

For nicer project descriptions, create a `dv-project.json` file in that repo's root. See `docs/PROJECT_METADATA.md` and `examples/dv-project.json`.

## Existing public project — correct its description

Edit `dv-project.json` **in that project's repo** and commit. Refresh the hub after GitHub's CDN/API caches update. You do not need to copy the description into the hub repo.

## Work-in-progress not publicly published

Add or edit an entry in the hub's `assets/projects.js` using the original v1.0 format. Set `status: 'development'` and no public repo URL. That draft continues to appear in the gallery. Once it becomes a public repo, GitHub discovery takes over (matches by `slug` or repository name).

## Hide an individual public repository

In that repo's `dv-project.json`, set `"visible": false`. Or put its name in the hub's `window.DV_HIDDEN_REPOS` list in `assets/projects.js`. Public repositories used only for coursework, tests or support files can be excluded this way.

## Artwork

You can use a screenshot from the project's repo in its metadata: `"cover": "images/cover.png"` (relative to the **project repository root**, not the hub). Existing featured projects keep the included hub illustrations unless you override them.

## Troubleshooting

- **New repo isn't shown:** check it is public, under `DVExperiments`, not a fork/archived repository, and wasn't hidden.
- **Description unchanged:** check filename `dv-project.json`, JSON syntax, file location in the repository root on its default branch, and allow for caching.
- **Still shows On GitHub:** verify Pages is *enabled in that project repo* and the Github API sync succeeds. Making a repo public alone does not count as Live.
- **Sync says OFFLINE:** GitHub API is inaccessible or rate-limited. Saved projects still load, but new ones can't be discovered until API requests succeed.
- **Local file preview:** use GitHub Pages or a local web server. Opening `index.html` as a `file://` page can prevent network calls in some browsers.
