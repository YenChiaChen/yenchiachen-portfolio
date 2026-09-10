import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

const SITE = 'https://www.yenchia.tw';
const AUTHOR = 'Yen-Chia Chen';
const TAGLINE = 'Notes on software, machine learning, and whatever else I am chewing on.';
const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css';

const root = path.dirname(new URL(import.meta.url).pathname);
const CONTENT = path.join(root, 'content');
const PUBLIC = path.join(root, 'public');
const DIST = path.join(root, 'dist');
const IMAGES = path.join(CONTENT, 'images');

marked.use(markedKatex({ throwOnError: false }));

// ```mermaid fences become <pre class="mermaid">; the client library draws them.
marked.use({
  renderer: {
    code(code, infostring) {
      if ((infostring || '').trim().split(/\s+/)[0] !== 'mermaid') return false;
      return `<pre class="mermaid">${esc(code)}</pre>\n`;
    },
  },
});

const hasMermaid = (body) => /^```mermaid\s*$/m.test(body);

/**
 * Mermaid is the one runtime dependency on the site, and it loads only on the
 * pages that actually contain a diagram. Without it those pages still render
 * the diagram source as a code block rather than breaking.
 */
const mermaidScript = () => `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
mermaid.initialize({
  startOnLoad: true,
  securityLevel: 'strict',
  theme: dark ? 'dark' : 'neutral',
  fontFamily: 'inherit',
  flowchart: { useMaxWidth: true, wrappingWidth: 320, padding: 12 },
});
</script>`;

// =========================================================================
// helpers
// =========================================================================

/** The one and only escaper. Every interpolated value goes through this. */
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Join child fragments; drops empty ones so callers can pass conditionals. */
const join = (...parts) => parts.flat().filter(Boolean).join('\n');

const tagSlug = (tag) => String(tag).trim().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[/\\?#%:]/g, '-');

/** URLs live in one place so hrefs and emitted directories can never drift. */
// Posts live under /p/; a page (frontmatter `page: true`) sits at the root.
const postPath = (post) => (post.page
  ? `/${encodeURIComponent(post.slug)}/`
  : `/p/${encodeURIComponent(post.slug)}/`);
const tagPath = (tag) => `/tag/${encodeURIComponent(tagSlug(tag))}/`;
const absolute = (p) => `${SITE}${p}`;

/** Covers may be a remote URL or a site-relative path; og:image needs absolute. */
const absoluteAsset = (u) => (!u ? ''
  : /^https?:\/\//.test(u) ? u
  : absolute(u.startsWith('/') ? u : `/${u}`));

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
}

const stripMd = (s) => s
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/[#>*_`~$|-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// =========================================================================
// components — each returns an HTML string, each usable on its own.
// Adding a new one means adding one more function here.
// =========================================================================

/** <head> metadata: title, description, Open Graph, Twitter card. */
const head = ({ title, description, url, ogType, image }) => join(
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  `<title>${esc(title === AUTHOR ? title : `${title} · ${AUTHOR}`)}</title>`,
  `<meta name="description" content="${esc(description)}">`,
  `<meta name="author" content="${esc(AUTHOR)}">`,
  `<link rel="canonical" href="${esc(url)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(description)}">`,
  `<meta property="og:type" content="${esc(ogType)}">`,
  `<meta property="og:url" content="${esc(url)}">`,
  `<meta property="og:site_name" content="${esc(AUTHOR)}">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(description)}">`,
  image ? `<meta property="og:image" content="${esc(image)}">` : '',
  image ? `<meta name="twitter:image" content="${esc(image)}">` : '',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="stylesheet" href="/style.css">',
  `<link rel="stylesheet" href="${esc(KATEX_CSS)}" crossorigin="anonymous">`,
);

const siteHeader = () => `<header class="site">
  <a class="brand" href="/">${esc(AUTHOR)}</a>
  <nav><a href="/about/">About</a></nav>
</header>`;

const siteFooter = () => `<footer class="site">
  <p>© ${new Date().getFullYear()} ${esc(AUTHOR)}</p>
</footer>`;

const tagChip = (tag) => `<li><a href="${esc(tagPath(tag))}">${esc(tag)}</a></li>`;

const tagChips = (tags) => (tags.length
  ? `<ul class="tags">${tags.map(tagChip).join('')}</ul>`
  : '');

const dateLine = (date) => (date
  ? `<p class="meta"><time datetime="${esc(date)}">${esc(date)}</time></p>`
  : '');

/** Thumbnail on a list entry. Absent cover simply renders nothing. */
const thumb = (post) => (post.cover
  ? `<a class="thumb" href="${esc(postPath(post))}" tabindex="-1" aria-hidden="true"><img src="${esc(post.cover)}" alt="" loading="lazy"></a>`
  : '');

/** Free-text haystack for the client-side search box. */
const searchText = (post) => [post.title, post.excerpt, ...post.tags].join(' ').toLowerCase();

/** One entry in a list of posts (index page, tag page). */
const postCard = (post, { showTags = true } = {}) => `<article class="card"
  data-tags="${esc(post.tags.map(tagSlug).join(' '))}"
  data-text="${esc(searchText(post))}">
  <div class="card-body">
    <h2><a href="${esc(postPath(post))}">${esc(post.title)}</a></h2>
    ${dateLine(post.date)}
    <p class="excerpt">${esc(post.excerpt)}</p>
    ${showTags ? tagChips(post.tags) : ''}
  </div>
  ${thumb(post)}
</article>`;

const postList = (posts, opts) => (posts.length
  ? posts.map((p) => postCard(p, opts)).join('\n')
  : '<p class="empty">No posts yet.</p>');

/** Title + date + tags at the top of a full article. */
const postHeader = (post) => `<h1>${esc(post.title)}</h1>
  ${dateLine(post.date)}
  ${tagChips(post.tags)}`;

const postArticle = (post) => `<article class="post">
  ${postHeader(post)}
  ${post.cover ? `<img class="hero" src="${esc(post.cover)}" alt="">` : ''}
  <div class="prose">${marked.parse(post.body)}</div>
</article>`;

const intro = () => `<section class="intro">
  <p>${esc(TAGLINE)}</p>
</section>`;

/**
 * Search box + tag chips. The chips are real links to the tag pages, so this
 * works with JavaScript off; indexScript() upgrades them to in-place filters.
 */
const filterBar = (tags) => `<div class="filter">
  <input class="search" type="search" placeholder="Search posts\u2026" autocomplete="off" aria-label="Search posts" hidden>
  ${tags.length ? `<ul class="tags chips">
    <li><a class="chip is-active" data-tag="" href="/">All</a></li>
    ${tags.map((t) => `<li><a class="chip" data-tag="${esc(tagSlug(t))}" href="${esc(tagPath(t))}">${esc(t)}</a></li>`).join('')}
  </ul>` : ''}
</div>`;

/** ~25 lines of vanilla filtering. The only JavaScript on the site. */
const indexScript = () => `<script>
(function () {
  var box = document.querySelector('.search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var none = document.querySelector('.no-match');
  var tag = '';
  box.hidden = false;
  function apply() {
    var term = box.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var hit = (!tag || (' ' + card.dataset.tags + ' ').indexOf(' ' + tag + ' ') > -1)
        && (!term || card.dataset.text.indexOf(term) > -1);
      card.hidden = !hit;
      if (hit) shown++;
    });
    none.hidden = shown > 0;
  }
  box.addEventListener('input', apply);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      tag = chip.dataset.tag;
      chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      apply();
    });
  });
})();
</script>`;

const pageTitle = (text) => `<h1 class="tagtitle">${esc(text)}</h1>`;

/** The shell every page is composed into. */
const layout = ({ title, description, url, body, ogType = 'website', image = '', script = '', lang = 'en' }) => `<!doctype html>
<html lang="${esc(lang)}">
<head>
${head({ title, description, url, ogType, image })}
</head>
<body>
${siteHeader()}
<main>
${body}
</main>
${siteFooter()}
${script}
</body>
</html>
`;

// =========================================================================
// pages — each composes components into a full document.
// =========================================================================

const indexPage = (posts, tags) => layout({
  title: AUTHOR,
  description: TAGLINE,
  url: absolute('/'),
  body: join(
    intro(),
    filterBar(tags),
    postList(posts),
    '<p class="empty no-match" hidden>No matching posts.</p>',
  ),
  script: posts.length ? indexScript() : '',
});

const postPage = (post) => layout({
  title: post.title,
  description: post.excerpt,
  url: absolute(postPath(post)),
  ogType: 'article',
  image: absoluteAsset(post.cover),
  body: postArticle(post),
  script: hasMermaid(post.body) ? mermaidScript() : '',
  lang: post.lang,
});

const tagPage = (label, posts) => layout({
  title: `#${label}`,
  description: `${posts.length} post(s) tagged ${label}.`,
  url: absolute(tagPath(label)),
  body: join(pageTitle(`#${label}`), postList(posts, { showTags: false })),
});

// =========================================================================
// content
// =========================================================================

/** ~15-line frontmatter parser. No dependency needed for this. */
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0 || !line.trim() || line.trimStart().startsWith('#')) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (val === 'true' || val === 'false') val = val === 'true';
    data[key] = val;
  }
  return { data, body: raw.slice(m[0].length) };
}

function loadPosts() {
  if (!fs.existsSync(CONTENT)) return [];
  return fs.readdirSync(CONTENT)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT, file), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const text = stripMd(body);
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title || file.replace(/\.md$/, ''),
        date: fmtDate(data.date),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        excerpt: data.excerpt || (text.length > 160 ? `${text.slice(0, 160)}…` : text),
        cover: data.cover || '',
        page: data.page === true,
        lang: data.lang || 'en',
        draft: data.draft === true,
        body,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

// =========================================================================
// emit
// =========================================================================

function write(relPath, html) {
  const out = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

const all = loadPosts();
const pages = all.filter((entry) => entry.page);
const posts = all.filter((entry) => !entry.page);

const byTag = new Map();
for (const post of posts) {
  for (const tag of post.tags) {
    const slug = tagSlug(tag);
    if (!byTag.has(slug)) byTag.set(slug, { label: tag, posts: [] });
    byTag.get(slug).posts.push(post);
  }
}
const allTags = [...byTag.values()].map((t) => t.label).sort((a, b) => a.localeCompare(b));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

write('index.html', indexPage(posts, allTags));
for (const post of posts) write(`p/${post.slug}/index.html`, postPage(post));
for (const page of pages) write(`${page.slug}/index.html`, postPage(page));
for (const [slug, { label, posts: tagged }] of byTag) write(`tag/${slug}/index.html`, tagPage(label, tagged));

fs.copyFileSync(path.join(root, 'style.css'), path.join(DIST, 'style.css'));
if (fs.existsSync(IMAGES)) fs.cpSync(IMAGES, path.join(DIST, 'images'), { recursive: true });
if (fs.existsSync(PUBLIC)) fs.cpSync(PUBLIC, DIST, { recursive: true });

console.log(`built ${posts.length} post(s), ${pages.length} page(s), ${byTag.size} tag page(s) → dist/`);
