# Portfolio

Personal site for Eberechukwu Uchechukwu Gerald, built with React and Vite.
Styling is plain CSS throughout, with no framework and no preprocessor.

## Running it

```bash
npm install
npm run dev      # development server on http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the built output on http://localhost:4173
```

## Deploying

One repository setting is needed before the first deploy:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

After that, every push to `main` builds the site and publishes it. The workflow
lives in `.github/workflows/deploy.yml`.

This step is not optional. The `index.html` in the repository root is the Vite
entry point, not a finished page: it asks the browser for `/src/main.jsx`, which
only exists as raw JSX. Pointing Pages at the repository root would serve that
file directly and every visitor would get a blank screen. Pages has to serve the
built output from `dist` instead, which is what the workflow uploads.

## Where things live

```
index.html              Vite entry point, plus all the meta and structured data
src/
  main.jsx              Mounts the app. Loads the global CSS before App, on purpose
  App.jsx               Page composition and the section order
  data/                 Every piece of copy and project record on the site
  hooks/                Scroll, viewport, motion preference and animation hooks
  components/           One folder per section, each with its own stylesheet
  styles/               Tokens, reset, base and shared keyframes
  assets/images/        Portrait and project screenshots
public/                 Files copied to the site root untouched
design/og-card.html     Source for the social preview image
legacy/                 The original static site, kept for reference
```

## Editing the content

Nearly all the wording lives in `src/data`, separate from the components:

- `profile.js` — name, contact details, hero copy, About section, nav links
- `services.js` — the four service cards
- `skills.js` — skill meters and tool chips
- `projects.js` — project records, filters and images
- `process.js` — the four process steps

A few things are worth knowing before you edit:

**Years of experience are derived, not typed.** `profile.js` sets
`START_YEAR = 2022` and works out the rest, so the hero corner, the intro
paragraph, the About paragraph and the stat tile can never disagree with each
other or quietly go stale. Change the year, not the sentences.

**Projects without a link.** Set `url` to `null` on a project and its card shows
a quiet placeholder rather than a dead link.

**Adding an icon.** Icons are inline SVG in `src/components/common/Icon.jsx`, so
there is no icon font to load. Add a new entry to the `shapes` map and reference
it by name.

**Regenerating the social card.** Open `design/og-card.html`, adjust it, then
screenshot it at exactly 1200 by 630 and save the result as `public/og-card.png`.

## Notes on the build

- React is split into its own chunk so it stays cached between deploys.
- The stylesheet is deliberately not code split, which keeps the first paint
  free of style flashes on a single page site.
- Images under 2kb are inlined into the bundle rather than fetched separately.

## Accessibility

The site is built to work without a mouse and without animation:

- Every control is reachable by keyboard, and the mobile menu holds focus while
  it is open and hands it back to the button that opened it.
- `prefers-reduced-motion` is honoured everywhere. Durations and delays both
  collapse, the typed headline prints in one go, the keyword band stops
  scrolling, and the custom pointer is switched off entirely.
- Form errors are announced, and focus moves to the first field that needs
  attention.
