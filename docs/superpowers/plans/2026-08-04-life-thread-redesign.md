# 人生編年史 Thread 重新設計 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把傳統作品集改造成一條依時間排序的個人「人生 thread」：可分類篩選、可點進看回覆串，內容存 git、透過只在本機執行的後台編輯器發布（自動 commit + push）。

**Architecture:** 雙層。(1) 公開純靜態站（React 19 + Vite + Tailwind CDN），啟動載入 `public/data/index.json` 渲染時間軸，點進某則再 `fetch` 該則完整內容。(2) 本機後台 = Vite dev-only middleware，提供 `/api/*` 寫檔端點，寫入 `public/threads/`、重建索引、跑 `git push`；正式 build 不含這些端點。

**Tech Stack:** React 19, TypeScript, Vite 5, Tailwind (CDN), `marked` + `marked-katex-extension`, `react-helmet-async`. 後台端點用 Node `fs/promises` + `child_process`（不加任何新相依）。

## Global Constraints

- **不新增 runtime 相依**：路由手刻（History API），圖片上傳走 base64 JSON（不引入 multer / multipart 套件）。
- **內容唯一真相 = git 檔案**，位於 `public/threads/<id>/`（`<id>` = `YYYYMMDD-<slug>`）。索引 `public/data/index.json` 為衍生檔，每次發布自動重建。
- **後台僅限本機**：所有 `/api/*` 端點只在 `configureServer`（`vite dev`）掛載；正式 build 完全不存在。`/admin` 路由僅 `import.meta.env.DEV` 可用，否則導回 `/`。
- **狀態值固定三種**：`'todo'` | `'doing'` | `'done'`。標籤為自由字串陣列。
- **單一語言**：UI 繁體中文，移除中英雙語切換（`LanguageContext` / `locales.ts` 雙語機制）。
- **圖片收進 repo**：存 `public/threads/<id>/images/`，post.json 內以相對路徑 `images/xxx.png` 引用。
- **沿用**：`MarkdownRenderer`（`content` prop）、`marked`+katex 設定、`react-helmet-async`、Tailwind 配色與字體。

---

## File Structure

**新增**
- `types.ts`（修改）— 新增 `Thread` / `ThreadReply` / `ThreadStatus` / `ThreadIndexEntry`。
- `utils/threads.ts` — 前台資料存取 + 純篩選函式。
- `utils/router.tsx` — 手刻路由 hook（History API）。
- `scripts/build-index.mjs` — 從 `public/threads/*/post.json` 產生 `public/data/index.json`。
- `scripts/build-index.test.mjs` — build-index 的 assert 型 self-check。
- `scripts/migrate-legacy.mjs` — 一次性遷移舊內容。
- `dev/thread-api.mjs` — Vite dev-only plugin（`/api/*` 寫檔端點）。
- `components/Timeline.tsx` — 首頁時間軸。
- `components/ThreadCard.tsx` — 單則貼文卡。
- `components/FilterBar.tsx` — 標籤 + 狀態篩選列。
- `components/ProfileHeader.tsx` — 頂端個人檔案列。
- `components/ThreadDetail.tsx` — 貼文詳情頁（內文 + 回覆串）。
- `components/StatusBadge.tsx` — 狀態徽章（三態共用）。
- `components/admin/AdminApp.tsx` — 後台入口（列表 + 編輯切換）。
- `components/admin/ThreadEditor.tsx` — 新增/編輯表單（含回覆、圖片上傳、預覽、發布）。
- `utils/adminApi.ts` — 後台呼叫 `/api/*` 的前端封裝。

**修改**
- `App.tsx` — 改為依路由渲染 Timeline / ThreadDetail / AdminApp。
- `components/SEO.tsx` — 改吃 props，移除 `useLanguage` 依賴。
- `vite.config.ts` — 掛上 `dev/thread-api.mjs` plugin。
- `package.json` — `prebuild` 跑 build-index、`build` 後產生 `404.html`。
- `index.html` — 更新 meta（描述改人生編年史）。

**刪除（遷移完成後）**
- `components/HeroSection/AboutSection/SkillsSection/ProjectsSection/BlogSection/ExperienceSection/AwardsSection/AcademicWorkSection/ContactSection/Navbar/Preloader.tsx`
- `contexts/LanguageContext.tsx`、`data/locales.ts`、`data/registry.ts`、`data/blog.ts`、`data/projects.ts`
- `public/posts/`、`public/projects/`、`utils/markdownLoader.ts`

---

## Task 1: 資料型別 + 前台存取與篩選函式

**Files:**
- Modify: `types.ts`
- Create: `utils/threads.ts`
- Test: `utils/threads.test.mjs`

**Interfaces:**
- Produces:
  - `type ThreadStatus = 'todo' | 'doing' | 'done'`
  - `interface ThreadReply { date: string; body: string; images?: string[] }`
  - `interface Thread { id: string; date: string; title: string; tags: string[]; status: ThreadStatus; body: string; cover?: string; replies: ThreadReply[] }`
  - `interface ThreadIndexEntry { id: string; date: string; title: string; tags: string[]; status: ThreadStatus; excerpt: string; cover?: string; replyCount: number }`
  - `filterThreads(entries: ThreadIndexEntry[], f: { tags: string[]; status: ThreadStatus | null }): ThreadIndexEntry[]`
  - `fetchIndex(): Promise<ThreadIndexEntry[]>` — `fetch('/data/index.json')`
  - `fetchThread(id: string): Promise<Thread>` — `fetch('/threads/'+id+'/post.json')`
  - `threadImageUrl(id: string, rel: string): string` — 把相對 `images/x` 轉成 `/threads/<id>/images/x`

- [ ] **Step 1: 寫失敗測試** `utils/threads.test.mjs`

```js
import assert from 'node:assert';
import { filterThreads } from './threads.js';

const E = [
  { id: 'a', tags: ['作品', '研究'], status: 'done' },
  { id: 'b', tags: ['隨筆'], status: 'todo' },
  { id: 'c', tags: ['作品'], status: 'doing' },
];

// 無篩選 → 全部
assert.equal(filterThreads(E, { tags: [], status: null }).length, 3);
// 單標籤
assert.deepEqual(filterThreads(E, { tags: ['作品'], status: null }).map(x => x.id), ['a', 'c']);
// 標籤 + 狀態（AND）
assert.deepEqual(filterThreads(E, { tags: ['作品'], status: 'done' }).map(x => x.id), ['a']);
// 多標籤 = 需同時含所有選定標籤（AND）
assert.deepEqual(filterThreads(E, { tags: ['作品', '研究'], status: null }).map(x => x.id), ['a']);
// 只有狀態
assert.deepEqual(filterThreads(E, { tags: [], status: 'todo' }).map(x => x.id), ['b']);
console.log('threads filter ok');
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `node utils/threads.test.mjs`
Expected: FAIL（找不到 `./threads.js` 或 `filterThreads`）

> 註：測試 import `./threads.js`，因此純函式 `filterThreads` 需能在 Node 執行。做法：在 `utils/threads.ts` 只放型別 + `fetch` 相關；把 `filterThreads` 放進 `utils/threads.ts` 並**額外**建一個編譯無關的 `utils/threads.js`？不要。改為：`filterThreads` 寫在 `utils/threads.ts`，測試檔改 import `./threads.ts` 不可行（Node 不解析 TS）。**採用**：把 `filterThreads` 這個純函式獨立成 `utils/filter.mjs`（純 JS，無型別），`utils/threads.ts` re-export 它。測試 import `../utils/filter.mjs`。

- [ ] **Step 3: 建純函式** `utils/filter.mjs`

```js
// 依標籤(AND)與狀態篩選。tags 為空陣列＝不限標籤；status 為 null＝不限狀態。
export function filterThreads(entries, { tags, status }) {
  return entries.filter(e => {
    const tagOk = tags.length === 0 || tags.every(t => e.tags.includes(t));
    const statusOk = status == null || e.status === status;
    return tagOk && statusOk;
  });
}
```

- [ ] **Step 4: 修測試 import 路徑並跑通**

把 test 檔首行改成 `import { filterThreads } from '../utils/filter.mjs';`，放到 `utils/threads.test.mjs`。
Run: `node utils/threads.test.mjs`
Expected: PASS，印出 `threads filter ok`

- [ ] **Step 5: 建型別與存取層** `utils/threads.ts`

```ts
import { filterThreads } from './filter.mjs';

export type ThreadStatus = 'todo' | 'doing' | 'done';
export interface ThreadReply { date: string; body: string; images?: string[]; }
export interface Thread {
  id: string; date: string; title: string; tags: string[];
  status: ThreadStatus; body: string; cover?: string; replies: ThreadReply[];
}
export interface ThreadIndexEntry {
  id: string; date: string; title: string; tags: string[];
  status: ThreadStatus; excerpt: string; cover?: string; replyCount: number;
}

export { filterThreads };

export async function fetchIndex(): Promise<ThreadIndexEntry[]> {
  const res = await fetch('/data/index.json');
  if (!res.ok) throw new Error('index.json 載入失敗');
  return res.json();
}
export async function fetchThread(id: string): Promise<Thread> {
  const res = await fetch(`/threads/${id}/post.json`);
  if (!res.ok) throw new Error(`貼文 ${id} 載入失敗`);
  return res.json();
}
export function threadImageUrl(id: string, rel: string): string {
  if (rel.startsWith('http') || rel.startsWith('/')) return rel;
  return `/threads/${id}/${rel}`;
}
```

在 `types.ts` 末尾 re-export 方便舊 import 風格：`export type { Thread, ThreadReply, ThreadStatus, ThreadIndexEntry } from './utils/threads';`

- [ ] **Step 6: Commit**

```bash
git add types.ts utils/threads.ts utils/filter.mjs utils/threads.test.mjs
git commit -m "feat: thread data types, fetch layer, and filter fn"
```

---

## Task 2: 索引產生器 build-index

**Files:**
- Create: `scripts/build-index.mjs`
- Test: `scripts/build-index.test.mjs`

**Interfaces:**
- Produces: `buildIndex(threadsDir: string): ThreadIndexEntry[]`（純函式，讀資料夾回傳陣列）與 `writeIndex(threadsDir, outFile)`（寫檔）。CLI：`node scripts/build-index.mjs` 讀 `public/threads` 寫 `public/data/index.json`。
- Consumes: `public/threads/<id>/post.json` 檔案結構（Task 1 的 `Thread`）。

- [ ] **Step 1: 寫失敗測試** `scripts/build-index.test.mjs`

```js
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildIndex } from './build-index.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'threads-'));
const dir = path.join(tmp, '20240115-demo');
fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify({
  id: '20240115-demo', date: '2024-01-15', title: 'Demo',
  tags: ['作品'], status: 'done',
  body: '# 標題\n\n這是**內文**，包含 [連結](http://x) 與 `code`。',
  cover: 'images/c.png',
  replies: [{ date: '2024-02-01', body: 'r1' }, { date: '2024-03-01', body: 'r2' }],
}));

const idx = buildIndex(tmp);
assert.equal(idx.length, 1);
const e = idx[0];
assert.equal(e.id, '20240115-demo');
assert.equal(e.replyCount, 2);
assert.equal(e.cover, '/threads/20240115-demo/images/c.png');
assert.ok(!/[#*`\[\]]/.test(e.excerpt), 'excerpt 應為去 markdown 的純文字');
assert.ok(e.excerpt.startsWith('標題'), 'excerpt 內容: ' + e.excerpt);
console.log('build-index ok');
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `node scripts/build-index.test.mjs`
Expected: FAIL（`buildIndex` 未定義）

- [ ] **Step 3: 實作** `scripts/build-index.mjs`

```js
import fs from 'node:fs';
import path from 'node:path';

const THREADS_DIR = 'public/threads';
const OUT = 'public/data/index.json';
const EXCERPT_LEN = 120;

// 極簡去除 markdown 記號，取純文字摘要（夠用即可，不求完美解析）
function toPlain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')       // code fence
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // image
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')// link → 文字
    .replace(/[#>*`_~\-]/g, ' ')            // 記號
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildIndex(threadsDir) {
  const ids = fs.existsSync(threadsDir)
    ? fs.readdirSync(threadsDir).filter(d =>
        fs.existsSync(path.join(threadsDir, d, 'post.json')))
    : [];
  const entries = ids.map(id => {
    const p = JSON.parse(fs.readFileSync(path.join(threadsDir, id, 'post.json'), 'utf8'));
    const plain = toPlain(p.body || '');
    return {
      id: p.id, date: p.date, title: p.title || '',
      tags: p.tags || [], status: p.status,
      excerpt: plain.slice(0, EXCERPT_LEN),
      cover: p.cover ? `/threads/${p.id}/${p.cover}` : undefined,
      replyCount: (p.replies || []).length,
    };
  });
  // 反時間序（新到舊）
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}

export function writeIndex(threadsDir = THREADS_DIR, outFile = OUT) {
  const idx = buildIndex(threadsDir);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(idx, null, 2));
  return idx;
}

// 直接執行時：讀預設資料夾寫索引
if (import.meta.url === `file://${process.argv[1]}`) {
  const idx = writeIndex();
  console.log(`index.json 已重建，共 ${idx.length} 則貼文`);
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `node scripts/build-index.test.mjs`
Expected: PASS，印出 `build-index ok`

- [ ] **Step 5: 接上 prebuild**

在 `package.json` scripts 加：`"prebuild": "node scripts/build-index.mjs"`（`npm run build` 前自動重建索引，避免手改 content 後索引過期）。

- [ ] **Step 6: Commit**

```bash
git add scripts/build-index.mjs scripts/build-index.test.mjs package.json
git commit -m "feat: build-index generator + prebuild hook"
```

---

## Task 3: 手刻路由

**Files:**
- Create: `utils/router.tsx`

**Interfaces:**
- Produces:
  - `useRoute(): { path: string }` — 回傳目前 `window.location.pathname`，隨 popstate 更新。
  - `navigate(to: string): void` — `history.pushState` + 觸發更新。
  - `Link({ to, children, className })` — `<a>` 攔截點擊改用 navigate。
  - `parseRoute(path): { name: 'home' } | { name: 'thread', id: string } | { name: 'admin' } | { name: 'notfound' }`

- [ ] **Step 1: 實作** `utils/router.tsx`

```tsx
import React, { useSyncExternalStore, useCallback } from 'react';

const listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, '', to);
  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit);
}

export function useRoute() {
  const path = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => window.location.pathname,
    () => '/',
  );
  return { path };
}

export function parseRoute(path: string) {
  if (path === '/' || path === '') return { name: 'home' as const };
  if (path === '/admin' || path === '/admin/') return { name: 'admin' as const };
  const m = path.match(/^\/thread\/([^/]+)\/?$/);
  if (m) return { name: 'thread' as const, id: decodeURIComponent(m[1]) };
  return { name: 'notfound' as const };
}

export const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> =
  ({ to, className, children }) => {
    const onClick = useCallback((e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // 允許新分頁
      e.preventDefault();
      navigate(to);
      window.scrollTo(0, 0);
    }, [to]);
    return <a href={to} className={className} onClick={onClick}>{children}</a>;
  };
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 無與 `utils/router.tsx` 相關錯誤。

- [ ] **Step 3: Commit**

```bash
git add utils/router.tsx
git commit -m "feat: minimal history-api router"
```

---

## Task 4: 共用 UI 小件（StatusBadge、SEO 改 props）

**Files:**
- Create: `components/StatusBadge.tsx`
- Modify: `components/SEO.tsx`

**Interfaces:**
- Produces:
  - `StatusBadge({ status }: { status: ThreadStatus })` — 三態徽章，中文標籤：todo=「想做」doing=「進行中」done=「完成」。
  - `SEO({ title?, description?, image? })` — 移除 `useLanguage`，全部走 props，有預設值。

- [ ] **Step 1: StatusBadge**

```tsx
import React from 'react';
import type { ThreadStatus } from '../utils/threads';

const MAP: Record<ThreadStatus, { label: string; cls: string }> = {
  todo:  { label: '想做',   cls: 'text-sub border-line' },
  doing: { label: '進行中', cls: 'text-accent border-accent/40' },
  done:  { label: '完成',   cls: 'text-seal border-seal/40' },
};

export const StatusBadge: React.FC<{ status: ThreadStatus }> = ({ status }) => {
  const s = MAP[status];
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${s.cls}`}>
      {s.label}
    </span>
  );
};
```

- [ ] **Step 2: SEO 改 props**（移除 useLanguage）

```tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps { title?: string; description?: string; image?: string; }

const DEFAULT_TITLE = '陳彥家 | 人生編年史';
const DEFAULT_DESC = '一條依時間排序的人生 thread：作品、學習、目標與生活紀錄。';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dcpzacz9d/image/upload/c_crop,w_1050,h_1300/v1766891265/%E6%9C%AA%E5%91%BD%E5%90%8D%E7%9A%84%E4%BD%9C%E5%93%81-1_2_uqfdws.webp';

export const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
  const t = title ? `${title}｜陳彥家` : DEFAULT_TITLE;
  const d = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const url = typeof window !== 'undefined' ? window.location.href : 'https://yenchia.tw/';
  return (
    <Helmet>
      <html lang="zh-TW" />
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="author" content="Yen-Chia Chen" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="zh_TW" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
};
```

- [ ] **Step 3: 型別檢查**

Run: `npx tsc --noEmit`
Expected: `SEO.tsx`、`StatusBadge.tsx` 無錯誤（App.tsx 可能因 Task 9 前暫時仍 import 舊 SEO，用法相容故不報錯）。

- [ ] **Step 4: Commit**

```bash
git add components/StatusBadge.tsx components/SEO.tsx
git commit -m "feat: StatusBadge + SEO props-based"
```

---

## Task 5: 首頁時間軸（ProfileHeader + FilterBar + ThreadCard + Timeline）

**Files:**
- Create: `components/ProfileHeader.tsx`, `components/FilterBar.tsx`, `components/ThreadCard.tsx`, `components/Timeline.tsx`

**Interfaces:**
- Consumes: `fetchIndex`, `filterThreads`, `ThreadIndexEntry`（Task 1）；`Link`（Task 3）；`StatusBadge`（Task 4）。
- Produces: `Timeline()` — 預設匯出首頁；內部管理 `selectedTags: string[]`、`selectedStatus: ThreadStatus | null`。

- [ ] **Step 1: ProfileHeader**

```tsx
import React from 'react';

export const ProfileHeader: React.FC = () => (
  <header className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
    <h1 className="font-serif text-3xl text-ink">陳彥家 Yen-Chia Chen</h1>
    <p className="mt-3 text-sub font-light">機器學習 × 全端 × 網球。這裡是我的人生編年史。</p>
    <nav className="mt-4 flex justify-center gap-5 text-xs font-mono uppercase tracking-widest text-sub">
      <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-seal">GitHub</a>
      <a href="mailto:charlisyenchiachen@gmail.com" className="hover:text-seal">Email</a>
    </nav>
  </header>
);
```
> 連結先放佔位，作者可自行改。

- [ ] **Step 2: FilterBar**

```tsx
import React from 'react';
import type { ThreadStatus } from '../utils/threads';

interface Props {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (t: string) => void;
  selectedStatus: ThreadStatus | null;
  onSelectStatus: (s: ThreadStatus | null) => void;
}
const STATUSES: { key: ThreadStatus; label: string }[] = [
  { key: 'todo', label: '想做' }, { key: 'doing', label: '進行中' }, { key: 'done', label: '完成' },
];

export const FilterBar: React.FC<Props> = ({ allTags, selectedTags, onToggleTag, selectedStatus, onSelectStatus }) => {
  const chip = (active: boolean) =>
    `text-xs px-3 py-1 rounded-full border transition-colors ${active ? 'bg-ink text-bg border-ink' : 'border-line text-sub hover:border-ink'}`;
  return (
    <div className="max-w-2xl mx-auto px-6 py-4 flex flex-wrap gap-2 items-center border-y border-line sticky top-0 bg-bg/90 backdrop-blur z-20">
      {STATUSES.map(s => (
        <button key={s.key} className={chip(selectedStatus === s.key)}
          onClick={() => onSelectStatus(selectedStatus === s.key ? null : s.key)}>{s.label}</button>
      ))}
      <span className="w-px h-4 bg-line mx-1" />
      {allTags.map(t => (
        <button key={t} className={chip(selectedTags.includes(t))} onClick={() => onToggleTag(t)}>#{t}</button>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: ThreadCard**

```tsx
import React from 'react';
import type { ThreadIndexEntry } from '../utils/threads';
import { StatusBadge } from './StatusBadge';
import { Link } from '../utils/router';

export const ThreadCard: React.FC<{ entry: ThreadIndexEntry }> = ({ entry }) => (
  <Link to={`/thread/${entry.id}`} className="block group">
    <article className="py-6 border-b border-line">
      <div className="flex items-center gap-3 text-xs font-mono text-sub">
        <time>{entry.date}</time>
        <StatusBadge status={entry.status} />
        {entry.tags.map(t => <span key={t} className="text-accent">#{t}</span>)}
      </div>
      {entry.title && <h2 className="mt-2 font-serif text-xl text-ink group-hover:text-seal transition-colors">{entry.title}</h2>}
      <p className="mt-1 text-sub font-light line-clamp-2">{entry.excerpt}</p>
      {entry.replyCount > 0 && <p className="mt-2 text-xs font-mono text-sub">↳ {entry.replyCount} 則後續</p>}
    </article>
  </Link>
);
```
> `line-clamp-2` 由 Tailwind CDN typography/core 提供；若未生效可改自訂樣式，非阻塞。

- [ ] **Step 4: Timeline（組裝 + 狀態）**

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchIndex, filterThreads, type ThreadIndexEntry, type ThreadStatus } from '../utils/threads';
import { ProfileHeader } from './ProfileHeader';
import { FilterBar } from './FilterBar';
import { ThreadCard } from './ThreadCard';
import { SEO } from './SEO';

export const Timeline: React.FC = () => {
  const [entries, setEntries] = useState<ThreadIndexEntry[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ThreadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchIndex().then(setEntries).catch(e => setError(String(e))); }, []);

  const allTags = useMemo(
    () => entries ? [...new Set(entries.flatMap(e => e.tags))].sort() : [],
    [entries]);
  const shown = useMemo(
    () => entries ? filterThreads(entries, { tags, status }) : [],
    [entries, tags, status]);

  const toggleTag = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SEO />
      <ProfileHeader />
      {entries && <FilterBar allTags={allTags} selectedTags={tags} onToggleTag={toggleTag}
        selectedStatus={status} onSelectStatus={setStatus} />}
      <main className="max-w-2xl mx-auto px-6">
        {error && <p className="py-12 text-seal">載入失敗：{error}</p>}
        {!entries && !error && <p className="py-12 text-sub">載入中…</p>}
        {shown.map(e => <ThreadCard key={e.id} entry={e} />)}
        {entries && shown.length === 0 && <p className="py-12 text-sub">沒有符合的貼文。</p>}
      </main>
    </div>
  );
};
```

- [ ] **Step 5: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 這四個檔無錯誤。

- [ ] **Step 6: Commit**

```bash
git add components/ProfileHeader.tsx components/FilterBar.tsx components/ThreadCard.tsx components/Timeline.tsx
git commit -m "feat: timeline home (profile + filter + cards)"
```

---

## Task 6: 貼文詳情頁 ThreadDetail

**Files:**
- Create: `components/ThreadDetail.tsx`

**Interfaces:**
- Consumes: `fetchThread`, `threadImageUrl`, `Thread`（Task 1）；`MarkdownRenderer`（既有，`content` prop）；`StatusBadge`、`SEO`、`Link`。
- Produces: `ThreadDetail({ id }: { id: string })`。

- [ ] **Step 1: 實作**

```tsx
import React, { useEffect, useState } from 'react';
import { fetchThread, threadImageUrl, type Thread } from '../utils/threads';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StatusBadge } from './StatusBadge';
import { SEO } from './SEO';
import { Link } from '../utils/router';

export const ThreadDetail: React.FC<{ id: string }> = ({ id }) => {
  const [post, setPost] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPost(null); setError(null);
    fetchThread(id).then(setPost).catch(e => setError(String(e)));
  }, [id]);

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16"><Link to="/" className="text-seal">← 回時間軸</Link><p className="mt-8 text-seal">載入失敗：{error}</p></div>;
  if (!post) return <div className="max-w-2xl mx-auto px-6 py-16 text-sub">載入中…</div>;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SEO title={post.title || post.date} description={post.body.slice(0, 100)}
        image={post.cover ? threadImageUrl(post.id, post.cover) : undefined} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="text-xs font-mono uppercase tracking-widest text-sub hover:text-seal">← 回時間軸</Link>
        <div className="mt-6 flex items-center gap-3 text-xs font-mono text-sub">
          <time>{post.date}</time><StatusBadge status={post.status} />
          {post.tags.map(t => <span key={t} className="text-accent">#{t}</span>)}
        </div>
        {post.title && <h1 className="mt-2 font-serif text-3xl text-ink">{post.title}</h1>}
        <div className="mt-6"><MarkdownRenderer content={post.body} /></div>

        {post.replies.length > 0 && (
          <section className="mt-12 border-t border-line pt-8 space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sub">後續 · {post.replies.length}</h2>
            {post.replies.map((r, i) => (
              <div key={i} className="pl-4 border-l-2 border-seal/30">
                <time className="text-xs font-mono text-sub">{r.date}</time>
                <div className="mt-2"><MarkdownRenderer content={r.body} /></div>
                {r.images?.map((img, j) => (
                  <img key={j} src={threadImageUrl(post.id, img)} alt="" className="mt-3 rounded-sm shadow" />
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 無錯誤。

- [ ] **Step 3: Commit**

```bash
git add components/ThreadDetail.tsx
git commit -m "feat: thread detail page with reply thread"
```

---

## Task 7: 後台寫檔端點（Vite dev-only plugin）

**Files:**
- Create: `dev/thread-api.mjs`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: default export `threadApiPlugin()` — Vite Plugin，`apply: 'serve'`（僅 dev）。端點：
  - `POST /api/thread` body `{ thread: Thread }` → 寫 `public/threads/<id>/post.json`（`mkdir -p`）。回 `{ ok: true }`。
  - `POST /api/thread/delete` body `{ id }` → `rm -rf public/threads/<id>`。
  - `POST /api/upload` body `{ id, filename, dataUrl }` → 解 base64 寫 `public/threads/<id>/images/<safeName>`，回 `{ path: 'images/<safeName>' }`。
  - `POST /api/publish` body `{ message }` → 重建 index.json（import `writeIndex`）→ `git add -A && git commit -m msg && git push`。回 `{ ok, log }` 或 `{ ok:false, error }`。
- Consumes: `writeIndex`（Task 2）。

- [ ] **Step 1: 實作** `dev/thread-api.mjs`

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeIndex } from '../scripts/build-index.mjs';

const pexec = promisify(execFile);
const ROOT = 'public/threads';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 50e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const send = (res, code, obj) => {
  res.statusCode = code; res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
};
// 僅允許安全 id / filename，擋路徑穿越
const safe = s => /^[A-Za-z0-9._一-鿿-]+$/.test(s);

async function handle(req, res) {
  const url = req.url.split('?')[0];
  const body = await readBody(req);
  if (url === '/api/thread') {
    const t = body.thread;
    if (!t?.id || !safe(t.id)) return send(res, 400, { error: 'bad id' });
    const dir = path.join(ROOT, t.id);
    await fs.mkdir(path.join(dir, 'images'), { recursive: true });
    await fs.writeFile(path.join(dir, 'post.json'), JSON.stringify(t, null, 2));
    return send(res, 200, { ok: true });
  }
  if (url === '/api/thread/delete') {
    if (!safe(body.id)) return send(res, 400, { error: 'bad id' });
    await fs.rm(path.join(ROOT, body.id), { recursive: true, force: true });
    return send(res, 200, { ok: true });
  }
  if (url === '/api/upload') {
    const { id, filename, dataUrl } = body;
    if (!safe(id) || !safe(filename)) return send(res, 400, { error: 'bad name' });
    const b64 = String(dataUrl).replace(/^data:[^;]+;base64,/, '');
    await fs.mkdir(path.join(ROOT, id, 'images'), { recursive: true });
    await fs.writeFile(path.join(ROOT, id, 'images', filename), Buffer.from(b64, 'base64'));
    return send(res, 200, { path: `images/${filename}` });
  }
  if (url === '/api/publish') {
    try {
      const idx = writeIndex();
      const msg = body.message || `post: update (${idx.length} threads)`;
      await pexec('git', ['add', '-A']);
      await pexec('git', ['commit', '-m', msg]);
      const { stdout } = await pexec('git', ['push']);
      return send(res, 200, { ok: true, log: stdout, count: idx.length });
    } catch (e) {
      return send(res, 200, { ok: false, error: e.stderr || e.message });
    }
  }
  return send(res, 404, { error: 'not found' });
}

export default function threadApiPlugin() {
  return {
    name: 'thread-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url.startsWith('/api/')) {
          handle(req, res).catch(e => send(res, 500, { error: String(e) }));
        } else next();
      });
    },
  };
}
```

- [ ] **Step 2: 掛到 vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import threadApi from './dev/thread-api.mjs';

export default defineConfig({
  plugins: [react(), threadApi()],
  base: '/',
  build: { outDir: 'dist', assetsDir: 'assets' },
});
```

- [ ] **Step 3: 手動驗證端點**

啟動：`npm run dev`，另開終端跑：
```bash
curl -s -X POST localhost:5173/api/thread -H 'Content-Type: application/json' \
  -d '{"thread":{"id":"20240101-test","date":"2024-01-01","title":"測試","tags":["測試"],"status":"done","body":"hello","replies":[]}}'
```
Expected: `{"ok":true}`，且 `public/threads/20240101-test/post.json` 存在。
清理：`curl -s -X POST localhost:5173/api/thread/delete -H 'Content-Type: application/json' -d '{"id":"20240101-test"}'`（確認資料夾被刪）。

- [ ] **Step 4: Commit**

```bash
git add dev/thread-api.mjs vite.config.ts
git commit -m "feat: dev-only thread write/publish api"
```

---

## Task 8: 後台 UI（AdminApp + ThreadEditor + adminApi）

**Files:**
- Create: `utils/adminApi.ts`, `components/admin/AdminApp.tsx`, `components/admin/ThreadEditor.tsx`

**Interfaces:**
- Consumes: `fetchIndex`, `fetchThread`, `Thread`, `ThreadReply`（Task 1）；`MarkdownRenderer`；`navigate`（Task 3）。
- Produces:
  - `adminApi.saveThread(t: Thread)`, `adminApi.deleteThread(id)`, `adminApi.uploadImage(id, file: File): Promise<string>`（回相對路徑）, `adminApi.publish(message?): Promise<{ok:boolean; error?:string; log?:string}>`。
  - `AdminApp()` — 若非 `import.meta.env.DEV` 則 `navigate('/')`；否則顯示貼文列表 + 「新增」+ 選取後進 `ThreadEditor`。

- [ ] **Step 1: adminApi**

```ts
import type { Thread } from './threads';

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}
export const adminApi = {
  saveThread: (thread: Thread) => post('/api/thread', { thread }),
  deleteThread: (id: string) => post('/api/thread/delete', { id }),
  publish: (message?: string) => post('/api/publish', { message }) as Promise<{ ok: boolean; error?: string; log?: string }>,
  async uploadImage(id: string, file: File): Promise<string> {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file);
    });
    const safeName = `${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
    const out = await post('/api/upload', { id, filename: safeName, dataUrl });
    return out.path as string; // 'images/xxx'
  },
};
```
> `Date.now()` 於瀏覽器端呼叫（非 workflow 腳本），可正常使用。

- [ ] **Step 2: ThreadEditor**（表單 + 圖片上傳 + 回覆 + 預覽）

```tsx
import React, { useState } from 'react';
import type { Thread, ThreadReply, ThreadStatus } from '../../utils/threads';
import { adminApi } from '../../utils/adminApi';
import { MarkdownRenderer } from '../MarkdownRenderer';

const STATUS: ThreadStatus[] = ['todo', 'doing', 'done'];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'post';

export const ThreadEditor: React.FC<{ initial: Thread | null; onDone: () => void }> = ({ initial, onDone }) => {
  const [t, setT] = useState<Thread>(initial ?? {
    id: '', date: new Date().toISOString().slice(0, 10), title: '', tags: [], status: 'doing', body: '', replies: [],
  });
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [msg, setMsg] = useState('');

  const ensureId = (): string => t.id || `${t.date.replace(/-/g, '')}-${slugify(t.title)}`;

  const upload = async (file: File, into: 'body' | number) => {
    const id = ensureId();
    const rel = await adminApi.uploadImage(id, file);
    if (into === 'body') setT(p => ({ ...p, id, body: `${p.body}\n\n![](${rel})\n` }));
    else setT(p => { const r = [...p.replies]; r[into] = { ...r[into], images: [...(r[into].images ?? []), rel] }; return { ...p, id, replies: r }; });
  };

  const save = async () => {
    const tags = tagsText.split(',').map(s => s.trim()).filter(Boolean);
    const thread = { ...t, id: ensureId(), tags };
    await adminApi.saveThread(thread);
    setMsg('已存檔（尚未發布）');
    setT(thread);
  };
  const publish = async () => {
    await save();
    const r = await adminApi.publish(`post: ${t.title || t.date}`);
    setMsg(r.ok ? `已發布 ✅（${r.count ?? ''} 則）` : `發布失敗：${r.error}`);
    if (r.ok) onDone();
  };
  const addReply = () => setT(p => ({ ...p, replies: [...p.replies, { date: new Date().toISOString().slice(0, 10), body: '' } as ThreadReply] }));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <button onClick={onDone} className="text-sm text-sub">← 返回列表</button>
      <div className="grid grid-cols-2 gap-3">
        <input className="border border-line px-2 py-1" type="date" value={t.date} onChange={e => setT(p => ({ ...p, date: e.target.value }))} />
        <select className="border border-line px-2 py-1" value={t.status} onChange={e => setT(p => ({ ...p, status: e.target.value as ThreadStatus }))}>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <input className="w-full border border-line px-2 py-1" placeholder="標題" value={t.title} onChange={e => setT(p => ({ ...p, title: e.target.value }))} />
      <input className="w-full border border-line px-2 py-1" placeholder="標籤（逗號分隔）" value={tagsText} onChange={e => setTagsText(e.target.value)} />
      <textarea className="w-full h-56 border border-line px-2 py-1 font-mono text-sm" placeholder="內文 markdown" value={t.body} onChange={e => setT(p => ({ ...p, body: e.target.value }))} />
      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'body')} />

      <div className="border-t border-line pt-4 space-y-3">
        <div className="flex justify-between"><h3 className="font-serif">回覆串</h3><button onClick={addReply} className="text-sm text-accent">+ 新增回覆</button></div>
        {t.replies.map((r, i) => (
          <div key={i} className="border border-line p-2 space-y-2">
            <input type="date" className="border border-line px-2 py-1" value={r.date} onChange={e => setT(p => { const rr = [...p.replies]; rr[i] = { ...rr[i], date: e.target.value }; return { ...p, replies: rr }; })} />
            <textarea className="w-full h-20 border border-line px-2 py-1 font-mono text-sm" value={r.body} onChange={e => setT(p => { const rr = [...p.replies]; rr[i] = { ...rr[i], body: e.target.value }; return { ...p, replies: rr }; })} />
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], i)} />
            <button onClick={() => setT(p => ({ ...p, replies: p.replies.filter((_, j) => j !== i) }))} className="text-xs text-seal">刪除此回覆</button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center border-t border-line pt-4">
        <button onClick={save} className="px-4 py-2 border border-ink">存檔</button>
        <button onClick={publish} className="px-4 py-2 bg-ink text-bg">發出（push）</button>
        <span className="text-sm text-sub">{msg}</span>
      </div>

      <div className="border-t border-line pt-4">
        <h3 className="font-serif mb-2">預覽</h3>
        <MarkdownRenderer content={t.body} />
      </div>
    </div>
  );
};
```

- [ ] **Step 3: AdminApp**

```tsx
import React, { useEffect, useState } from 'react';
import { fetchIndex, fetchThread, type Thread, type ThreadIndexEntry } from '../../utils/threads';
import { adminApi } from '../../utils/adminApi';
import { navigate } from '../../utils/router';
import { ThreadEditor } from './ThreadEditor';

export const AdminApp: React.FC = () => {
  const [list, setList] = useState<ThreadIndexEntry[]>([]);
  const [editing, setEditing] = useState<Thread | null | 'new'>(null);

  const reload = () => fetchIndex().then(setList).catch(() => setList([]));
  useEffect(() => { if (!import.meta.env.DEV) { navigate('/'); return; } reload(); }, []);
  if (!import.meta.env.DEV) return null;

  if (editing) return <ThreadEditor initial={editing === 'new' ? null : editing} onDone={() => { setEditing(null); reload(); }} />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl">後台</h1>
        <button onClick={() => setEditing('new')} className="px-4 py-2 bg-ink text-bg">＋ 新貼文</button>
      </div>
      <ul className="divide-y divide-line">
        {list.map(e => (
          <li key={e.id} className="py-3 flex justify-between items-center">
            <button className="text-left" onClick={async () => setEditing(await fetchThread(e.id))}>
              <span className="font-mono text-xs text-sub mr-2">{e.date}</span>{e.title || e.excerpt.slice(0, 20)}
            </button>
            <button className="text-xs text-seal" onClick={async () => { if (confirm('刪除？')) { await adminApi.deleteThread(e.id); await adminApi.publish(`delete ${e.id}`); reload(); } }}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

- [ ] **Step 4: 型別檢查 + 手動驗證**

Run: `npx tsc --noEmit`（無錯誤）
手動：`npm run dev` → 開 `localhost:5173/admin` → 新增一則、上傳圖、按「存檔」→ 確認 `public/threads/<id>/post.json` 與圖片存在（先不要真的 push 測試，用「存檔」即可）。

- [ ] **Step 5: Commit**

```bash
git add utils/adminApi.ts components/admin/AdminApp.tsx components/admin/ThreadEditor.tsx
git commit -m "feat: local admin editor (list, edit, upload, publish)"
```

---

## Task 9: App.tsx 路由組裝 + 404 fallback + index.html meta

**Files:**
- Modify: `App.tsx`, `package.json`, `index.html`

**Interfaces:**
- Consumes: `useRoute`, `parseRoute`（Task 3）；`Timeline`、`ThreadDetail`、`AdminApp`。

- [ ] **Step 1: 重寫 App.tsx**

```tsx
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useRoute, parseRoute } from './utils/router';
import { Timeline } from './components/Timeline';
import { ThreadDetail } from './components/ThreadDetail';
import { AdminApp } from './components/admin/AdminApp';

export default function App() {
  const { path } = useRoute();
  const route = parseRoute(path);
  return (
    <HelmetProvider>
      {route.name === 'thread' ? <ThreadDetail id={route.id} />
        : route.name === 'admin' ? <AdminApp />
        : route.name === 'notfound' ? <Timeline />  /* 未知路徑退回時間軸 */
        : <Timeline />}
    </HelmetProvider>
  );
}
```
> 移除舊的 `LanguageProvider`、Preloader、分區 import。

- [ ] **Step 2: 404 fallback for GitHub Pages**

`package.json` 的 `build` 改為 build 後複製 index.html 成 404.html：
```json
"build": "tsc && vite build && cp dist/index.html dist/404.html"
```
（GH Pages 對未知路徑回 404.html，內容同 index.html → SPA 深連結 `/thread/:id` 可正確載入。）

- [ ] **Step 3: 更新 index.html meta**

把 `<title>`、`description`、og/twitter 標題描述改為人生編年史版本（例：title「陳彥家 | 人生編年史」、description「一條依時間排序的人生 thread」）。移除不再需要的段落即可，非阻塞。

- [ ] **Step 4: 型別檢查 + 啟動驗證**

Run: `npx tsc --noEmit`（無錯誤）
`npm run dev` → `/` 顯示時間軸（此時可能空，因尚未遷移）→ 手動建立一則後點進 `/thread/<id>` 正常。

- [ ] **Step 5: Commit**

```bash
git add App.tsx package.json index.html
git commit -m "feat: route wiring + gh-pages 404 fallback + meta"
```

---

## Task 10: 舊內容遷移腳本

**Files:**
- Create: `scripts/migrate-legacy.mjs`

**Interfaces:**
- Consumes: `public/projects/*.md`, `public/posts/*.md`（frontmatter：title/category/type/tags/achievement/excerpt/imageUrl）；經歷 / 獎項資料（腳本內嵌，取自 `data/locales.ts` zh-TW）。
- Produces: `public/threads/<id>/post.json` × N，並呼叫 `writeIndex()` 重建索引。

- [ ] **Step 1: 實作** `scripts/migrate-legacy.mjs`

```js
import fs from 'node:fs';
import path from 'node:path';
import { writeIndex } from './build-index.mjs';

const OUT = 'public/threads';

// 極簡 frontmatter 解析（對齊 utils/markdownLoader 的行為）
function parse(text) {
  const clean = text.replace(/^﻿/, '').trimStart();
  const m = clean.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!m) return { meta: {}, body: clean };
  const meta = {};
  m[1].split(/\r?\n/).forEach(line => {
    line = line.trim(); if (!line || line.startsWith('#')) return;
    const i = line.indexOf(':'); if (i < 0) return;
    const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) meta[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    else meta[k] = v.replace(/^['"]|['"]$/g, '');
  });
  return { meta, body: m[2] };
}

const slugFromFile = f => path.basename(f, '.md');
function write(id, obj) {
  const dir = path.join(OUT, id);
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(obj, null, 2));
}

// 1) 專案與文章推測日期（作者之後於後台微調）。key = 檔名 slug。
const DATES = {
  // 專案
  'master-thesis': '2025-06-01',
  'ppbank': '2020-08-01',
  'shooly': '2020-05-01',
  'lili': '2019-11-01',
  'constructing-an-enterprise-grade-cloud-native-headless-cms': '2023-09-01',
  'adaptive-zero-trust-architecture-via-deep-learning-log-analysis': '2024-03-01',
  'kubernetes-migration-strategy-and-hpa-latency-analysis': '2023-12-01',
  'semantic-reasoning-for-traffic-liability-determination-from-unstructured-text-to-automated-legal-attribution': '2024-06-01',
  'financial-sentiment-quantification-platform-via-heterogeneous-text-mining': '2023-05-01',
  'addressing-imbalance-in-UNSW': '2022-11-01',
  'neural-extractive-text-summarization-with-syntactic-compression': '2022-06-01',
  'flight-route-network-analysis-via-link-prediction-and-optimization': '2022-03-01',
  'vision-transformer-image-recognition-with-pure-attention': '2021-12-01',
  // 文章
  'long-text-to-image-converter-for-financial-reports': '2024-01-15',
  'applications-of-machine-learning-in-healthcare-research': '2023-10-01',
  'reconfigurable-process-element-design-for-edge-ai': '2023-08-01',
  'opportunity-and-challenge-of-ai-technique-on-satellite-remote-sensing': '2023-06-01',
  'the-future-of-computer-interfaces-in-metaverse': '2022-09-01',
  'machine-learning-enabled-minimal-latency-wireless-networking-for-emerging-ai-applications': '2023-03-01',
  'winograd-architecture-design-for-edge-ai-accelerator': '2023-01-01',
};

function migrateDir(srcDir, typeTag) {
  if (!fs.existsSync(srcDir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(srcDir).filter(x => x.endsWith('.md'))) {
    const slug = slugFromFile(f);
    const { meta, body } = parse(fs.readFileSync(path.join(srcDir, f), 'utf8'));
    const date = DATES[slug] || '2023-01-01';
    const id = `${date.replace(/-/g, '')}-${slug}`;
    const tags = [typeTag, ...(Array.isArray(meta.tags) ? meta.tags : [])];
    write(id, {
      id, date, title: meta.title || slug, tags, status: 'done',
      body, cover: undefined, replies: [],
      // imageUrl 為外部 URL；放進 body 開頭當封面圖，保留不破圖
    });
    if (meta.imageUrl) {
      const p = path.join(OUT, id, 'post.json');
      const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
      obj.cover = meta.imageUrl;              // threadImageUrl 對 http 開頭原樣輸出
      fs.writeFileSync(p, JSON.stringify(obj, null, 2));
    }
    n++;
  }
  return n;
}

// 2) 經歷（內嵌自 locales zh-TW）
const EXPERIENCE = [
  { date: '2021-01-01', role: '全端工程師', company: '個人工作室', desc: ['精通 TypeScript / React / Go 生態系。', '為上市公司提供 ESG 平台、CMS 後台與品牌形象網站開發。', '對我而言，寫 Code 是冥想的一種。'] },
  { date: '2019-01-01', role: '共同創辦人 & CTO', company: 'Homie Studio', desc: ['負責 Swift / Java 行動應用開發。', '研發多款獲獎產品，包含金融與居家服務 App。', '曾經有過連續 56 小時在線 Debug 的紀錄。'] },
  { date: '2016-01-01', role: '研發工程師', company: '至上電子', desc: ['使用 C# / .NET / MySQL 構建企業基礎設施。', '開發與維護內部 MIS 與 ERP 系統。'] },
  { date: '2017-09-01', role: '學士 / 碩士', company: '臺灣科技大學', desc: ['專研 C++ / Python 與深度學習應用。', '主導多項產學合作與資安國際論文發表。'] },
];
// 3) 獎項（內嵌自 locales zh-TW）
const AWARDS = [
  { date: '2020-11-01', title: '金獎（冠軍）', org: '華南金控金融科技競賽', desc: 'API 實證組全國第一。主導金融服務架構設計與產品級 API 實作。' },
  { date: '2020-06-01', title: '第一名（冠軍）', org: 'LINE Chatbot 對話機器人設計大賽', desc: '開發「Shooly」，一個創新的水電服務預約機器人。' },
  { date: '2020-01-01', title: '創業賽事常勝軍', org: '經濟部 / 科技部 / 教育部', desc: '創業歸故里決賽、FITI 全國 40 強、教育部 U-Start 補助。' },
  { date: '2019-05-01', title: '第二名', org: '中科智慧創新創業競賽', desc: '開發線上智慧展覽館。' },
  { date: '2019-01-01', title: '網球成就', org: '全大運 / 台科精誠盃', desc: '十二年體保生生涯，台北市冠軍、台科精誠盃男單冠軍，台科大網球隊隊長。' },
];

function migrateExperience() {
  EXPERIENCE.forEach((e, i) => {
    const id = `${e.date.replace(/-/g, '')}-exp-${i}`;
    write(id, { id, date: e.date, title: `${e.role}｜${e.company}`, tags: ['經歷'], status: 'done',
      body: e.desc.map(d => `- ${d}`).join('\n'), replies: [] });
  });
  return EXPERIENCE.length;
}
function migrateAwards() {
  AWARDS.forEach((a, i) => {
    const id = `${a.date.replace(/-/g, '')}-award-${i}`;
    write(id, { id, date: a.date, title: a.title, tags: ['獎項'], status: 'done',
      body: `**${a.org}**\n\n${a.desc}`, replies: [] });
  });
  return AWARDS.length;
}

const counts = {
  projects: migrateDir('public/projects', '作品'),
  posts: migrateDir('public/posts', '文章'),
  experience: migrateExperience(),
  awards: migrateAwards(),
};
const idx = writeIndex();
console.log('遷移完成', counts, '→ index 共', idx.length, '則');
```

- [ ] **Step 2: 執行遷移**

Run: `node scripts/migrate-legacy.mjs`
Expected: 印出各類數量（作品 13、文章 7、經歷 4、獎項 5）與 index 總數；`public/threads/` 出現對應資料夾與 `public/data/index.json`。

- [ ] **Step 3: 目視驗證**

`npm run dev` → `/` 時間軸出現遷移貼文，點標籤 `作品` 剩 13 則、`文章` 剩 7 則，點進任一則內文與圖片正常顯示。

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-legacy.mjs public/threads public/data/index.json
git commit -m "feat: migrate legacy projects/posts/experience/awards into threads"
```

---

## Task 11: 移除舊程式與死碼

**Files:**
- Delete: 見下方清單
- Modify: 任何殘留 import

- [ ] **Step 1: 刪除舊分區元件與雙語**

```bash
git rm components/HeroSection.tsx components/AboutSection.tsx components/SkillsSection.tsx \
  components/ProjectsSection.tsx components/BlogSection.tsx components/ExperienceSection.tsx \
  components/AwardsSection.tsx components/AcademicWorkSection.tsx components/ContactSection.tsx \
  components/Navbar.tsx components/Preloader.tsx \
  contexts/LanguageContext.tsx data/locales.ts data/registry.ts data/blog.ts data/projects.ts \
  utils/markdownLoader.ts
git rm -r public/posts public/projects
```

- [ ] **Step 2: 確認無殘留 import**

Run: `grep -rnE "LanguageContext|locales|markdownLoader|registry|HeroSection|Navbar|Preloader" --include=*.ts --include=*.tsx . | grep -v node_modules`
Expected: 無輸出（若有，改掉該 import）。

- [ ] **Step 3: 全量建置驗證**

Run: `npm run build`
Expected: `tsc` 通過、`vite build` 成功、`dist/404.html` 存在、`dist/data/index.json` 與 `dist/threads/**` 一併輸出。

- [ ] **Step 4: 預覽驗證**

Run: `npm run preview`
手動：時間軸、篩選、點進詳情、深連結 `/thread/<id>` 直接重整可載入（靠 404 fallback，preview 下若不生效屬正常，以實際 GH Pages 為準）。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy sections, bilingual, and dead loaders"
```

---

## Task 12: 收尾 — README 與部署說明

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 寫使用說明**

`README.md` 記錄：如何寫貼文（`npm run dev` → `localhost:5173/admin` → 編輯 → 發出）、資料放哪（`public/threads/<id>/post.json`）、圖片放哪、索引如何重建（自動 / `node scripts/build-index.mjs`）、部署（push main → GitHub Actions）。

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: authoring & deploy guide"
```

---

## Self-Review

**1. Spec coverage**
- 雙層架構 → Task 7（dev API）+ Task 9（正式站不含）。✅
- 資料結構 `post.json` + `index.json` → Task 1、2。✅
- 前台時間軸 / 篩選 / 詳情 / 回覆串 → Task 5、6。✅
- 後台新增/編輯/刪除/上傳/預覽/發布 → Task 7、8。✅
- 舊內容全遷移 + 日期推測 → Task 10。✅
- 單一語言、移除雙語 → Task 4（SEO）、9、11。✅
- 圖片收進 repo → Task 7 upload + Task 8 uploadImage。✅
- 路由 + 404 fallback + 深連結 SEO → Task 3、9、6（helmet）。✅
- 移除舊分區 → Task 11。✅

**2. Placeholder scan**：無 TBD/TODO；所有 code step 皆含實際程式。遷移日期為刻意的推測值（spec 已授權，作者後台微調）。✅

**3. Type consistency**：`Thread`/`ThreadReply`/`ThreadStatus`/`ThreadIndexEntry` 全程一致；`filterThreads` 簽名於 Task 1 定義、Task 5 使用一致；`writeIndex`/`buildIndex` 於 Task 2 定義、Task 7/10 使用一致；`adminApi` 方法名於 Task 8 定義並自用。✅

**Ceilings (ponytail)**：index.json 單檔載入全部中繼資料（規模大再分頁）；摘要用極簡 markdown 去記號（非完整解析，夠用）；路由手刻僅涵蓋 3 種路徑。
