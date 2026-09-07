# yenchia.tw

A static blog. One build script (`build.mjs`), one stylesheet (`style.css`), markdown in `content/`.

## Write a post

Create `content/<slug>.md`. The filename becomes the URL: `/p/<slug>/`.

```
---
title: Why Postgres advisory locks bite
date: 2026-01-15
tags: [Backend, Postgres]
excerpt: Optional. Falls back to the first 160 characters of the body.
cover: /images/locks.png
draft: false
---

Markdown body. Code blocks, tables, images, and $\LaTeX$ math all work.
```

Fields: `title`, `date` (YYYY-MM-DD, used for ordering), `tags` (optional list),
`excerpt` (optional), `cover` (optional), `draft` (set `true` to skip the post entirely).

## Images

Drop files in `content/images/`; they are copied to `dist/images/`, so reference
them as `/images/<file>` from both `cover:` and the markdown body:

```markdown
![alt text](/images/locks.png)
```

A remote URL works in either place too. `cover:` is used three ways: the
thumbnail in the post list, the banner at the top of the article, and `og:image`
for link previews on LinkedIn and elsewhere.

## The index page

The home page carries a search box and clickable tag chips that filter the list
in place. The chips are ordinary links to `/tag/<tag>/`, so the site still works
with JavaScript disabled — the ~25 lines in `indexScript()` only upgrade them.

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
