# Portfolio

Personal portfolio site of Eberechukwu Uchechukwu Gerald, software developer
and interface designer.

A single-page site covering what I do, the tools I work with, selected
projects, and how I approach a build from first conversation to launch. Built
with React and Vite, styled in plain CSS, and designed to work just as well
without a mouse or without animation.

**Live at [geraldxtra.github.io](https://geraldxtra.github.io)**

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the built output
```

## Adding my resume

The download button in the hero points at `public/resume.pdf`. The file in
there now is a placeholder. Drop the real PDF in over it, keep the same name,
and the button starts working. Nothing else needs editing.

The name the browser saves it as is `resumeName` in `src/data/profile.js`.

## Deploying

Set **Settings → Pages → Build and deployment → Source: GitHub Actions** once.
After that every push to `main` builds and publishes automatically, via
`.github/workflows/deploy.yml`.

This step is not optional. The `index.html` in the repository root is the Vite
entry point, not a finished page: it asks the browser for `/src/main.jsx`,
which only exists as raw JSX. Pointing Pages at the repository root would serve
that file directly and every visitor would get a blank screen.

## Editing the content

Almost all the wording lives in `src/data`, away from the components:
`profile.js`, `services.js`, `skills.js`, `projects.js` and `process.js`.

Two things worth knowing:

- **Years of experience are worked out, not typed.** `profile.js` counts from
  `WORKING_YEAR`, so the hero, the About paragraph and the stat tile can never
  drift apart. Change the year, not the sentences.
- **A project with `url: null`** shows a quiet placeholder instead of a dead
  link.

## Theming

Colour lives in two tiers in `src/styles/tokens.css`. The palette is the brand
and never changes. The semantic tier underneath it says which palette entry
plays which role, and only that tier is redefined for light mode.

That means a component never needs a light and a dark rule: it asks for
`--surface` or `--fg` and gets the right answer. If you add a component, reach
for the semantic names, not `--ink-850`, or it will not follow the theme.

The theme follows the operating system until someone uses the toggle, after
which their choice is remembered. A small inline script in `index.html` applies
it before the first paint so the page never flashes the wrong colour.

---

© 2026 Eberechukwu Uchechukwu Gerald
