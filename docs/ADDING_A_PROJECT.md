# Adding a project to DV Experiments

**Every project lives in `assets/projects.js`.** You do not have to create a new HTML page. Changes become visible as soon as GitHub Pages deploys your updated file.

## Step 1 — Copy a project entry

Add this example inside the `window.DV_PROJECTS = [ ... ];` array, separated from the previous entry by a comma:

```js
{
  slug: 'example-project',             // unique, lowercase, hyphen-separated
  title: 'Example Project',            // shown on homepage and page heading
  tagline: 'A short, memorable line.',
  category: 'Games',                   // Simulations / Tools / Games
  status: 'development',              // live / repository / development
  platform: 'Python / Desktop',
  year: '2026',
  featured: false,                    // one published project can be featured
  image: 'assets/cover-pocket-pal.svg',
  imageAlt: 'Editorial illustration representing Example Project',
  description: 'One or two sentences that explain what it does.',
  overview: [
    'What inspired this project and why does it exist?',
    'What does someone actually do with it?'
  ],
  highlights: [
    'A feature worth exploring',
    'Another interesting system'
  ],
  tags: ['Python', 'Prototype', 'Creativity'],
  liveUrl: '',                         // fill ONLY after browser site is live
  repoUrl: '',                         // fill ONLY after public repo exists
  notice: 'In development. Not yet publicly playable.'
}
```

For a new cover image, put a `.png`, `.jpg`, `.webp` or `.svg` in `assets/`, then replace `image` with its relative path. Use real screenshots if you have them. The provided images are **concept illustrations**, not in-game captures.

## Step 2 — Choose the correct availability

| Status | When to use | Buttons shown |
| --- | --- | --- |
| `live` | A published browser experience | Launch in browser if `liveUrl` is set; GitHub if `repoUrl` is set |
| `repository` | Source code is public but no browser experience is live | View on GitHub |
| `development` | Work-in-progress, prototype, or unpublished concept | No broken outgoing buttons |

**Status does not automatically create a URL.** Supply actual published URLs in `liveUrl` and `repoUrl`. Only `https://` URLs are used as external links.

## Step 3 — Save and publish

Commit and push `assets/projects.js` and any new image to your GitHub Pages repository. Your card is instantly part of the search and category filters after the site updates.

Your project detail page will have this form:

`https://dvexperiments.github.io/project.html?slug=example-project`

## Editing the site look and feel

Use `assets/styles.css`:

- The top `:root` block defines the dark-theme palette.
- `:root[data-theme="light"]` defines the light-theme palette.
- `.hero` controls the main landing-page layout.
- `.project-grid` and `.project-card` control the gallery.
- `.detail-*` selectors control project pages.

You can also replace the homepage's featured Live Lab text and illustration in `index.html` if you want to feature a different browser app. The large hero's preview is automatically based on the `featured` project in the data.

## Ideas for future updates

- Add actual screenshots and short gameplay GIFs.
- Add progress updates or changelogs per project.
- Create an opt-in GitHub API feed for public releases only.
- Add iframe previews for apps that allow embedding, preferably with a full-screen launch alternative.
- Add a **Live Observatory** when a genuinely persistent/shared Little Worlds simulation is available; the current browser experience is per-visitor, not a shared always-running server world.
