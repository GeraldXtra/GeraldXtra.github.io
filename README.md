# Portfolio

Personal site of Eberechukwu Uchechukwu Gerald, Web & App Developer & UI/UX
Designer in Lagos, Nigeria.

One page with an about section, projects (including FreshFind, a TechWiz 7
team project), skills, a contact form and a downloadable resume. Built with
React and Vite and plain CSS, with light and dark themes.

**Live at [geraldxtra.github.io](https://geraldxtra.github.io)**

## Run it

```
npm install
npm run dev
```

`npm run build` writes the site to `dist`. Pushing to `main` deploys it to
GitHub Pages through `.github/workflows/deploy.yml`.

## Resume

The resume is written in `resume/resume.html` and `resume/resume.css`, with
Archivo self hosted from `resume/fonts`. To rebuild the PDFs after editing it:

```
npm run resume
```

That prints two files with headless Chrome: `public/resume.pdf` (dark, the one
the site links to) and `public/resume-light.pdf` (light, for printing). It needs
Google Chrome installed, or the path to a Chrome or Chromium binary in the
`CHROME_PATH` environment variable.

---

© 2026 Eberechukwu Uchechukwu Gerald
