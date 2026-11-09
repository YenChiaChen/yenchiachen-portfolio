import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const SITE = 'https://www.yenchia.tw';
const AUTHOR = 'Yen-Chia Chen';

const root = path.dirname(new URL(import.meta.url).pathname);
const CONTENT = path.join(root, 'content');
const PUBLIC = path.join(root, 'public');
const DIST = path.join(root, 'dist');
const IMAGES = path.join(CONTENT, 'images');

/** The one and only escaper. Every interpolated value goes through this. */
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const join = (...parts) => parts.flat().filter(Boolean).join('\n');

// content/index.md is the home page; every other content/<slug>.md is /<slug>/.
const pagePath = (slug) => (slug === 'index' ? '/' : `/${encodeURIComponent(slug)}/`);

const head = ({ title, description, url }) => join(
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  `<title>${esc(title === AUTHOR ? title : `${title} · ${AUTHOR}`)}</title>`,
  `<meta name="description" content="${esc(description)}">`,
  `<meta name="author" content="${esc(AUTHOR)}">`,
  `<link rel="canonical" href="${esc(url)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(description)}">`,
  '<meta property="og:type" content="website">',
  `<meta property="og:url" content="${esc(url)}">`,
  `<meta property="og:site_name" content="${esc(AUTHOR)}">`,
  '<meta name="twitter:card" content="summary">',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap">',
  '<link rel="stylesheet" href="/style.css">',
);

// Icon paths from Simple Icons (CC0).
const SOCIAL = [
  ['LinkedIn', 'https://www.linkedin.com/in/yenchia-chen/', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.91v4.43zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'],
  ['GitHub', 'https://github.com/YenChiaChen', 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'],
];

const socialLinks = () => SOCIAL.map(([label, href, d]) => `<a href="${esc(href)}" aria-label="${label}" rel="me noopener" target="_blank"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg></a>`).join('');

// The nav is a toggle: home links to Projects, every other page links back home.
const siteHeader = (slug) => `<header class="site">
  <div class="id"><span class="brand">${esc(AUTHOR)}</span><span class="social">${socialLinks()}</span></div>
  <nav>${slug === 'index' ? '<a href="/projects/">Projects</a>' : '<a href="/">About</a>'}</nav>
</header>`;

// The clock is the only script on the site; without JS the footer just omits the time.
const siteFooter = () => `<footer class="site">
  <div class="foot">
    <p>© ${new Date().getFullYear()} ${esc(AUTHOR)}</p>
    <p>Taipei <span id="clock"></span> · probably shipping something</p>
    <span class="social">${socialLinks()}</span>
  </div>
</footer>
<script>
(function () {
  var el = document.getElementById('clock');
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit' });
  function tick() { el.textContent = fmt.format(new Date()); }
  tick();
  setInterval(tick, 10000);
})();
</script>`;

const pageHtml = (page) => {
  const top = page.slug === 'index' ? '' : `<h1 class="page-title">${esc(page.title)}</h1>`;
  return `<!doctype html>
<html lang="${esc(page.lang)}">
<head>
${head({ title: page.slug === 'index' ? AUTHOR : page.title, description: page.excerpt, url: `${SITE}${pagePath(page.slug)}` })}
</head>
<body>
${siteHeader(page.slug)}
<main>
${top}
<div class="prose">${marked.parse(page.body)}</div>
</main>
${siteFooter()}
</body>
</html>
`;
};

/** ~15-line frontmatter parser. No dependency needed for this. */
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0 || !line.trim() || line.trimStart().startsWith('#')) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: raw.slice(m[0].length) };
}

const pages = fs.readdirSync(CONTENT)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
    const slug = file.replace(/\.md$/, '');
    return { slug, body, title: data.title || slug, excerpt: data.excerpt || '', lang: data.lang || 'en' };
  });

fs.rmSync(DIST, { recursive: true, force: true });
for (const page of pages) {
  const out = path.join(DIST, page.slug === 'index' ? '' : page.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, pageHtml(page));
}

fs.copyFileSync(path.join(root, 'style.css'), path.join(DIST, 'style.css'));
if (fs.existsSync(IMAGES)) fs.cpSync(IMAGES, path.join(DIST, 'images'), { recursive: true });
if (fs.existsSync(PUBLIC)) fs.cpSync(PUBLIC, DIST, { recursive: true });

console.log(`built ${pages.length} page(s) → dist/`);
