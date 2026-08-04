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
