# yenchia.tw

A static portfolio site. One build script (`build.mjs`), one stylesheet (`style.css`), markdown in `content/`.

## Pages

Every `content/<slug>.md` becomes `/<slug>/`; `content/index.md` is the home page.
Frontmatter: `title`, `excerpt` (meta description), `lang` (default `en`).
Images go in `content/images/` and are referenced as `/images/<file>`.

The old blog posts are kept, unbuilt, in `archive/posts/`.

## Build and preview

```bash
npm install
npm run build     # emits dist/
npm run dev       # builds, then serves dist/ at http://localhost:5180
```

## Deploy

Push to `main`. The GitHub Actions workflow (`.github/workflows/deploy.yml`)
runs `npm ci && npm run build` and publishes `dist/` to GitHub Pages.
The custom domain comes from `public/CNAME`.
