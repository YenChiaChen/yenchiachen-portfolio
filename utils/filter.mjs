// 依標籤(AND)與狀態篩選。tags 為空陣列＝不限標籤；status 為 null＝不限狀態。
export function filterThreads(entries, { tags, status }) {
  return entries.filter(e => {
    const tagOk = tags.length === 0 || tags.every(t => e.tags.includes(t));
    const statusOk = status == null || e.status === status;
    return tagOk && statusOk;
  });
}
