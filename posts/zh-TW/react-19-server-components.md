# 範式轉移：React 19 Server Components

React 19 Server Components (RSC) 代表了自 Hooks 引入以來，React 心智模型最重大的變革。

## 為什麼需要 RSC？

主要目標是提升 **效能** 與 **開發體驗**。透過將數據獲取移至伺服器：

1. **零打包體積**：僅在伺服器使用的程式碼不會被發送到客戶端。
2. **直接存取後端**：內部數據獲取不再需要複雜的 API 層。
3. **自動程式碼拆分**：伺服器組件自然會帶來更好的區塊劃分。

### 實際範例

```javascript
// 這在伺服器上運行
async function UserProfile({ id }) {
  const user = await db.users.get(id); // 直接調用資料庫！
  return <div>{user.name}</div>;
}
```

## 極簡主義的禪意

在最近的專案中，採用這種模式減少了近 30% 的客戶端打包體積，證明了有時候「少即是多」。