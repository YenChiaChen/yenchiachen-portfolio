# 人生編年史 Thread — 網站重新設計 (Design Spec)

**日期**：2026-08-04
**狀態**：已與作者確認方向，待寫實作計畫

## 一句話

把現有的傳統作品集，改造成一條依時間排序的「人生 thread」：每則貼文可點進去看詳情、能追加帶時間戳的回覆與圖片、可用自由標籤與狀態欄位分類篩選（點 `作品` 標籤即變回作品集，點 `想做` 狀態即看未完成的目標）。作者透過**只在本機執行的後台編輯器**寫作，按「發出」在背後自動 `git commit + push`，訪客看到的仍是純靜態網站。

## 目標與非目標

**目標**
- 反時間序的個人生命時間軸，取代原本的分區式作品集。
- 每則貼文：日期、自由標籤、狀態、標題、markdown 內文、圖片、一串帶時間戳的回覆。
- 依標籤 / 狀態即時篩選（客戶端）。
- 本機後台：新增 / 編輯 / 刪除貼文與回覆、拖曳上傳圖片、標籤自動補全、狀態切換、預覽、一鍵「發出」（自動 commit + push）。
- 把現有 13 專案 + 7 文章 + 經歷 + 獎項全部遷移成時間軸貼文。

**非目標（本次不做）**
- 公開留言 / 訪客互動（「回覆」只有作者本人透過後台新增）。
- 草稿模式、私密貼文。
- 專屬「目標看板」頁（用時間軸的狀態篩選即可）。
- 雙語 / 中英切換（改為單一語言，UI 繁體中文；移除既有 `LanguageContext` 雙語機制）。
- 外部圖床、外部資料庫、任何正式環境後端。
- 視覺 / 外觀設計（本 spec 只定功能與資料結構；外觀之後另做一輪）。

## 架構總覽（雙層）

```
┌─ 公開靜態網站 (GitHub Pages, yenchia.tw) ── 訪客看到的時間軸
│    純靜態、快、免費、無執行期後端。沿用 React 19 + Vite + TS + Tailwind(CDN)。
│    載入 public/data/index.json 渲染時間軸；點進某則再載入該則完整內容。
│
└─ 本機後台 (只在 npm run dev 存在) ────────── 作者的編輯器
     Vite dev-only middleware 提供 /api/* 寫檔端點（不另起 server）。
     寫入 content/ → 重建 index.json → child_process 執行 git add/commit/push。
     正式 build 不含後台 API；/admin 路由僅在 import.meta.env.DEV 下可用。
```

**為什麼這樣切**：內容永久存在 git（有版本、免費、SEO 與離線皆可），但作者不必手動碰 git；後台只跑在本機，正式站沒有任何可被攻擊的寫入端點。

## 資料結構（git 檔案 = 唯一真相）

每則貼文一個資料夾，圖片與內容同置好管理：

```
content/threads/<id>/
  post.json        # 見下方 schema
  images/          # 這則貼文與其回覆貼的圖（相對路徑引用）
```

`<id>`：`YYYYMMDD-<slug>`（日期前綴讓資料夾天然依時間排、slug 便於辨識與 URL）。

### post.json schema

```jsonc
{
  "id": "20240115-master-thesis",
  "date": "2024-01-15",              // 貼文主日期 (ISO)
  "title": "碩士論文完成",             // 可留空字串
  "tags": ["作品", "研究"],           // 自由標籤，可多個
  "status": "done",                  // "todo" | "doing" | "done"
  "body": "markdown 內文…",           // 支援 katex（沿用現有 marked 設定）
  "cover": "images/cover.png",       // 可選，時間軸卡片預覽圖（相對 post 資料夾）
  "replies": [
    {
      "date": "2024-03-02",          // 回覆自己的時間戳
      "body": "markdown…",
      "images": ["images/xxx.png"]   // 可選
    }
  ]
}
```

狀態值固定三種：`todo`（想做）/ `doing`（進行中）/ `done`（完成）。標籤為自由字串。

### 衍生索引 `public/data/index.json`

給時間軸首頁一次載入 + 客戶端篩選用的輕量清單（不含完整 body / replies）：

```jsonc
[
  {
    "id": "20240115-master-thesis",
    "date": "2024-01-15",
    "title": "碩士論文完成",
    "tags": ["作品", "研究"],
    "status": "done",
    "excerpt": "內文前 N 字純文字摘要…",
    "cover": "content/threads/20240115-master-thesis/images/cover.png",
    "replyCount": 3
  }
]
```

- **每次「發出」時由後台自動重建**；另提供一支 `scripts/build-index.mjs`，在 `npm run build` 前跑一次（`prebuild`），確保即使手動改過 `content/` 也不會讓索引過期。
- 首頁 fetch 這一份即可渲染整條時間軸與所有篩選；點進某則貼文才 fetch 該則 `content/threads/<id>/post.json` 拿完整內文與回覆。

> ponytail: index.json 一次載入全部貼文中繼資料。個人紀錄規模下可用很久；若哪天貼文數大到首頁載入變慢，再改成分頁 / 分片載入。

## 前台（功能結構，外觀 TBD）

- **路由**
  - `/` — 時間軸首頁（含頂端個人檔案列 + 篩選列 + 貼文卡列表）
  - `/thread/:id` — 貼文詳情（完整內文 + 回覆串），可深連結、可分享
  - `/admin` — 後台編輯器（僅 `import.meta.env.DEV`；正式版導回首頁）
  - GitHub Pages SPA fallback：build 時把 `index.html` 複製成 `404.html`，讓深連結能正確載入。
- **個人檔案列**：名字、一句簡介、外部連結（GitHub / LinkedIn / Email 等）。取代原本 Hero/About/Contact 分區。
- **篩選列**：所有出現過的標籤 + 三種狀態；點選即客戶端篩選時間軸（可組合，例如 `作品 + done`）。
- **貼文卡**：日期 · 標籤 · 狀態徽章 · 標題/摘要 · 回覆數 ·（有 cover 則顯示預覽圖）。
- **詳情頁**：完整 markdown（katex 沿用）+ 底下依時間排的回覆串，每則回覆顯示時間戳與圖片。
- 每則貼文以 `react-helmet-async`（既有）輸出各自的 title / description / og:image 供分享與 SEO。

## 本機後台（dev-only）

- **寫入端點**（Vite `configureServer` middleware，只在 dev 掛載）：
  - `POST /api/thread` 建立 / 覆寫某則 `post.json`（含新增回覆）。
  - `DELETE /api/thread/:id` 刪除整則（含資料夾）。
  - `POST /api/upload` 接收圖片（multipart 或 base64），存到該則 `images/`，回傳相對路徑。
  - `POST /api/publish` 重建 `index.json` → `git add -A && git commit -m <訊息> && git push`。
  - 每個端點先確認 `import.meta.env.DEV` / server 僅綁 localhost。
- **後台 UI（`/admin` React 頁）**：貼文列表（可搜尋）、新增/編輯表單（標題、內文 markdown、標籤自動補全、狀態下拉、日期）、拖曳上傳圖片並插入 markdown、回覆編輯、即時預覽、「發出」按鈕。
- **git 認證**：沿用作者本機既有的 git 認證（他本來就能 push），後台只是代跑指令。
- 失敗處理：git push 失敗時，端點回傳 stderr 給 UI 顯示，檔案已寫入本地不會遺失（作者可手動處理）。

> ponytail: 後台複用 Vite dev server，不另外架 Express。正式站完全沒有這些端點。

## 舊內容遷移

- 來源：`public/projects/*.md`（13）、`public/posts/*.md`（7）、`components/*Section.tsx` 與 `data/locales.ts` 內的經歷 / 獎項資料。
- 目標：各轉成一則 `content/threads/<id>/post.json`，狀態 `done`，標籤分別打 `作品` / `文章` / `獎項` / `經歷`（作品/文章保留原標籤）。
- 圖片：既有引用的圖搬進各自 `images/`（或保留原 public 路徑，遷移腳本擇一，以不破圖為準）。
- 日期：**由 Claude 依內容 / 獎項年份推測**填入，作者上線後於後台逐則微調。
- 遷移以一支一次性腳本 `scripts/migrate-legacy.mjs` 完成，產出 `content/` 後即可刪除舊 `public/posts`、`public/projects`、`data/registry.ts`。

## 需要移除 / 取代的舊東西

- 分區元件：`HeroSection` `AboutSection` `SkillsSection` `ProjectsSection` `BlogSection` `ExperienceSection` `AwardsSection` `ContactSection` `AcademicWorkSection` `Navbar`（改為時間軸 + 個人檔案列 + 篩選列）。
- 雙語：`contexts/LanguageContext.tsx` 與 `data/locales.ts` 的雙語切換（改單一語言）。
- `data/registry.ts`、`public/posts`、`public/projects`（遷移後移除）。
- 保留沿用：Vite/TS 設定、Tailwind CDN 與配色、字體、`marked`+katex、`react-helmet-async`、`MarkdownRenderer`、`SEO`、frontmatter/markdown 解析概念。

## 測試策略（ponytail：非瑣碎邏輯留一個可跑的檢查）

- `scripts/build-index.mjs`：附一個 `content/` fixture + assert 產出的 index.json 欄位正確（含 excerpt 生成、replyCount）。
- 遷移腳本：對少數樣本 assert 轉出的 `post.json` 結構正確。
- 前台篩選函式（依標籤 + 狀態）抽成純函式，一個 assert 型 self-check。
- 後台寫檔端點：手動驗證即可（dev-only，不建自動化整合測試）。

## 開放的小決定（實作時定，不阻塞）

- 詳情頁用獨立路由頁還是 modal overlay（傾向獨立路由，利於深連結 / SEO）。
- 客戶端路由用最小手刻（History API）還是引入 router 套件（依實作時取捨，需支援上一頁 / 深連結 / 404 fallback）。
- 遷移時圖片是搬進 `images/` 還是保留原路徑（以不破圖、最少改動為準）。
