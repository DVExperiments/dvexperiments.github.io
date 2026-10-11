/*
 * DV Experiments local catalogue (fallback and unpublished concepts).
 * Public repositories and Pages status are discovered automatically via GitHub.
 * For correct, up-to-date project descriptions, create dv-project.json in
 * the ROOT of each PUBLIC project repository. See docs/PROJECT_METADATA.md.
 * These entries are used while GitHub data is loading or unavailable.
 */
window.DV_PROJECTS = [
  {
    slug: 'little-worlds',
    title: 'Little Worlds',
    tagline: 'A living ecosystem you can nudge out of balance.',
    category: 'Simulations',
    status: 'live',
    platform: 'Browser / JavaScript',
    year: '2026',
    featured: true,
    image: 'assets/cover-little-worlds.svg',
    imageAlt: 'Concept illustration of a living green island habitat',
    description: 'An interactive ecosystem-themed browser experiment. For the latest features and release information, visit the live project or its GitHub repository.',
    overview: [
      'Little Worlds is an experiment in building an interactive miniature ecosystem.',
      'For current gameplay and features, see the latest published browser build.'
    ],
    highlights: [],
    tags: ['Ecosystems', 'Simulation', 'JavaScript', 'AI-assisted'],
    liveUrl: 'https://dvexperiments.github.io/Little-Worlds-NZ/',
    repoUrl: 'https://github.com/DVExperiments/Little-Worlds-NZ',
    notice: 'The project runs through GitHub Pages. The current feature list is maintained in its project repository.'
  },
  {
    slug: 'nz-ecosim',
    title: 'NZ EcoSim',
    tagline: 'A miniature Aotearoa ecosystem with unexpected consequences.',
    category: 'Simulations',
    status: 'live', // User reports GitHub Pages enabled; live status is synced from GitHub.
    platform: 'GitHub Pages / project',
    year: '2026',
    featured: false,
    image: 'assets/cover-nz-ecosim.svg',
    imageAlt: 'Stylised illustrated New Zealand island ecosystem and species',
    description: 'An ecosystem simulation project inspired by Aotearoa New Zealand. Visit the published Pages site or project repository for details of the current release.',
    overview: [
      'NZ EcoSim is a project exploring ecological simulation, with its current published version accessible through GitHub Pages.',
      'Add dv-project.json to the NZ EcoSim repository to supply the precise features and description displayed here.'
    ],
    highlights: [],
    tags: ['Python', 'Ecology', 'Education', 'Desktop'],
    liveUrl: '', // Resolved from GitHub's Pages API when online.
    repoUrl: 'https://github.com/DVExperiments/nz-ecosim',
    notice: 'NZ EcoSim has a published GitHub Pages edition. The hub checks GitHub to resolve its live link and current availability.'
  },
  {
    slug: 'spaceport-07',
    title: 'Spaceport 07',
    tagline: 'Keep the interstellar arrivals board moving.',
    category: 'Simulations',
    status: 'development',
    platform: 'Python / Desktop',
    year: '2026',
    featured: false,
    image: 'assets/cover-spaceport.svg',
    imageAlt: 'Illustration of futuristic orbital docking station and landing craft',
    description: 'A spaceport management simulation exploring operations, traffic, scheduling and the wonderfully messy systems behind a sci-fi transport hub.',
    overview: [
      'Spaceport 07 turns an imagined transport hub into a playground of interconnected systems. Manage a fictional spaceport, track what is happening on the ground, and respond to a world that keeps moving.',
      'This project is being refined as a Python desktop experience. A public release or repository link can be added here when ready.'
    ],
    highlights: ['A responsive spaceport operations interface', 'Sci-fi arrivals, movement and system management', 'Exploration of game-like simulation and UI design'],
    tags: ['Management', 'Python', 'Simulation', 'Sci-fi'],
    liveUrl: '',
    repoUrl: '',
    notice: 'In development. No public launch or repository link is listed yet.'
  },
  {
    slug: 'gamesignal',
    title: 'GameSignal',
    tagline: 'A gaming dashboard built around your own view.',
    category: 'Tools',
    status: 'development',
    platform: 'Desktop application',
    year: '2026',
    featured: false,
    image: 'assets/cover-gamesignal.svg',
    imageAlt: 'Illustrated dark gaming dashboard with charts and configurable panels',
    description: 'An evolving modular dashboard experiment exploring resizable widgets, information density and personalised ways of viewing game-related information.',
    overview: [
      'GameSignal is an experiment in turning scattered game-related information into a flexible, highly configurable dashboard.',
      'Its focus is on draggable and resizable widgets, layouts that adjust to the available screen space, and giving different kinds of information room to breathe.'
    ],
    highlights: ['Customisable dashboard layout', 'Widgets for different information needs', 'Responsive panels and flexible information density'],
    tags: ['Dashboard', 'UX/UI', 'Widgets', 'Desktop'],
    liveUrl: '',
    repoUrl: '',
    notice: 'In development. The dashboard is not currently published as a web app.'
  },
  {
    slug: 'pocket-pal',
    title: 'Pocket Pal',
    tagline: 'A tiny digital creature with a mind of its own.',
    category: 'Games',
    status: 'development',
    platform: 'Python / Desktop concept',
    year: '2026',
    featured: false,
    image: 'assets/cover-pocket-pal.svg',
    imageAlt: 'Illustrated pixel-inspired handheld virtual pet with a small creature',
    description: 'A deliberately simple virtual-pet experiment where the relationship goes both ways: your creature may be learning about you, too.',
    overview: [
      'Pocket Pal reimagines the original virtual-pet feeling: compact interactions, simple needs, playful personality, and a relationship that develops over time.',
      'The experiment explores an unusual twist: a pet that sometimes initiates activities, invents signals, or teaches its owner how to interact rather than only waiting for commands.'
    ],
    highlights: ['Simple virtual-pet care rather than feature overload', 'Personality shaped through everyday interactions', 'Two-way communication and playful learning'],
    tags: ['Virtual pet', 'Python', 'Game design', 'AI-assisted'],
    liveUrl: '',
    repoUrl: '',
    notice: 'Concept and active development. This is not a publicly playable release.'
  }
];

/* Optional: public repository names to suppress from the hub even when they
 * have no dv-project.json yet. This works alongside `"visible": false` in a
 * project's own JSON file. Entries are case-insensitive repo names.
 * Example: window.DV_HIDDEN_REPOS = ['test-repo', 'scratchpad'];
 */
window.DV_HIDDEN_REPOS = [];
