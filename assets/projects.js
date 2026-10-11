/*
 * DV Experiments project catalogue.
 * This is the ONLY file you need to edit to add/remove projects or update links.
 * See docs/ADDING_A_PROJECT.md for field descriptions and examples.
 *
 * Important: Don't add a liveUrl until that website is actually published.
 * For works not yet on GitHub, leave repoUrl as an empty string.
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
    description: 'A browser-based ecology sandbox inspired by Aotearoa. Explore the relationships between species, habitats, environmental pressures and human decisions.',
    overview: [
      'Little Worlds invites you to experiment with a changing ecosystem. Introduce native or invasive species, adjust conditions, and watch populations and habitats respond over simulated time.',
      'The web edition runs locally in each visitor’s browser, with a journal, inspection tools, environmental overlays, and ways to save and share a simulated world.'
    ],
    highlights: ['Introduce wildlife and change environmental conditions', 'Explore food webs, population changes and ecosystem alerts', 'Inspect individual creatures and explore map overlays', 'Save your own world locally or export its data'],
    tags: ['Ecosystems', 'Simulation', 'JavaScript', 'AI-assisted'],
    liveUrl: 'https://dvexperiments.github.io/Little-Worlds-NZ/',
    repoUrl: 'https://github.com/DVExperiments/Little-Worlds-NZ',
    notice: 'The web edition is a stylised educational model, not a scientific prediction tool. Every visitor runs an independent simulation in their own browser.'
  },
  {
    slug: 'nz-ecosim',
    title: 'NZ EcoSim',
    tagline: 'A miniature Aotearoa ecosystem with unexpected consequences.',
    category: 'Simulations',
    status: 'repository',
    platform: 'Python / Desktop',
    year: '2026',
    featured: false,
    image: 'assets/cover-nz-ecosim.svg',
    imageAlt: 'Stylised illustrated New Zealand island ecosystem and species',
    description: 'A desktop ecosystem simulator featuring native wildlife, introduced predators, settlements, conservation challenges and interactive systems.',
    overview: [
      'NZ EcoSim is a Python desktop project that simulates life on a miniature island: forests, oceans, wildlife, changing seasons, and the effects of settlement and introduced species.',
      'The repository documents educational challenges, ecological events, a food web, class-report exports and tools for experimenting with different conservation approaches.'
    ],
    highlights: ['Generate new islands and choose different scenarios', 'Observe wildlife, food webs and ecological change', 'Explore settlements and conservation interventions', 'Use lessons, charts and class-report tools'],
    tags: ['Python', 'Ecology', 'Education', 'Desktop'],
    liveUrl: '',
    repoUrl: 'https://github.com/DVExperiments/nz-ecosim',
    notice: 'Repository available. This is primarily a Python desktop application, not a published browser experience.'
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
