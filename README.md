# 人生編年史 — 時間軸作品集

依時間排序的個人「人生 thread」網站。純靜態部署到 GitHub Pages，編輯工作在本機後台進行。

---

## 快速開始

### 本機環境

```bash
npm install
npm run dev
```

開啟 <http://localhost:5173/admin> 進入編輯介面。

### 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動本機後台編輯伺服器（Vite dev server） |
| `npm run build` | 編譯並打包正式版本到 `dist/` |
| `npm run preview` | 預覽正式版本（不含後台編輯功能） |

---

## 如何編寫貼文

### 完整流程

1. 執行 `npm run dev`
2. 開啟 <http://localhost:5173/admin>
3. **新增或編輯貼文**：
   - 標題
   - 內文（Markdown 格式，支援 KaTeX 數學式）
   - 標籤列表
   - 狀態 `status`：`todo`（顯示「想做」）/ `doing`（顯示「進行中」）/ `done`（顯示「完成」）
   - 日期（YYYY-MM-DD）
   - 封面圖片（選填）
4. **上傳圖片**：拖曳或選檔上傳，後台自動存到 `public/threads/<id>/images/`
5. **編輯回覆串**：在貼文內新增或編輯評論
6. **預覽**：頁面實時顯示效果
7. **發出**：點擊「發出」按鈕
   - 自動重建索引（`public/data/index.json`）
   - 執行 `git commit -m "post: update (N threads)"`
   - 執行 `git push`
   - GitHub Actions 隨即自動部署

### 本機存檔（不發佈）

編輯後點「存檔」只會更新本機檔案，不會 commit 或 push。

---

## 資料結構

### 貼文格式

每則貼文存為單獨資料夾 `public/threads/<id>/post.json`，其中 `<id>` = `YYYYMMDD-<slug>`  
（例：`20240615-my-first-post`）

### post.json 結構

```json
{
  "id": "20240615-my-first-post",
  "date": "2024-06-15",
  "title": "我的第一篇貼文",
  "tags": ["生活", "學習"],
  "status": "done",
  "body": "# 標題\n\n這是 Markdown 內文...",
  "cover": "images/cover.jpg",
  "replies": [
    {
      "id": "reply-001",
      "author": "朋友",
      "body": "評論內容",
      "date": "2024-06-16"
    }
  ]
}
```

### 圖片存放

- 位置：`public/threads/<id>/images/<filename>`
- 在內文中以絕對路徑引用：
  ```markdown
  ![描述](/threads/20240615-my-first-post/images/photo.jpg)
  ```

---

## 索引系統

`public/data/index.json` 是衍生檔，記錄所有貼文的摘要（時間軸首頁載入用）。

### 自動重建

發出貼文時自動觸發重建，以及 `npm run build` 前的 `prebuild` 步驟。

### 手動重建

```bash
node scripts/build-index.mjs
```

會輸出：`index.json 已重建，共 N 則貼文`

### 索引內容

```json
[
  {
    "id": "20240615-my-first-post",
    "date": "2024-06-15",
    "title": "我的第一篇貼文",
    "tags": ["生活", "學習"],
    "status": "done",
    "excerpt": "摘要文字（120字以內）...",
    "cover": "/threads/20240615-my-first-post/images/cover.jpg",
    "replyCount": 1
  }
]
```

索引按時間反序排列（新到舊）。

---

## 本機後台架構

### 編輯界面

後台編輯器只在 `npm run dev` 時可用，通過 Vite dev-only plugin 提供 API 端點。

### API 端點（本機開發用）

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/thread` | POST | 保存貼文（新增或更新） |
| `/api/thread/delete` | POST | 刪除貼文 |
| `/api/upload` | POST | 上傳圖片 |
| `/api/publish` | POST | 發佈（commit + push） |

### 正式環境

`npm run build` 後的 `dist/` 是純靜態文件，完全不含後台 API，訪客只能瀏覽。

---

## 部署

### GitHub Pages

1. 編輯並在本機發出貼文
2. `git push` 觸發 GitHub Actions（`.github/workflows/deploy.yml`）
3. Actions 執行 `npm install --legacy-peer-deps && npm run build`
4. 產物上傳到 GitHub Pages
5. 網域 <https://yenchia.tw> 自動更新

### 404 fallback

`npm run build` 會複製 `dist/index.html` 為 `dist/404.html`，讓深連結（如 `/thread/20240615-my-first-post`）可直接載入。

---

## 遷移備註

舊內容已通過 `scripts/migrate-legacy.mjs` 一次性遷移進 `public/threads/`，不再需要手動操作。

---

## 技術棧

- **前端框架**：React 19 + TypeScript
- **標記語言**：Markdown（marked）+ KaTeX 支援
- **打包工具**：Vite 5
- **SEO**：React Helmet Async
- **部署**：GitHub Pages + GitHub Actions
