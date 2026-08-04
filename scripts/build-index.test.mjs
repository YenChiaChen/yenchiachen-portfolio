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

const dir2 = path.join(tmp, '20200801-external-cover');
fs.mkdirSync(path.join(dir2, 'images'), { recursive: true });
fs.writeFileSync(path.join(dir2, 'post.json'), JSON.stringify({
  id: '20200801-external-cover', date: '2020-08-01', title: 'External Cover',
  tags: ['作品'], status: 'done',
  body: '外部封面圖測試',
  cover: 'https://res.cloudinary.com/demo/image/upload/x.jpg',
  replies: [],
}));

const idx = buildIndex(tmp);
assert.equal(idx.length, 2);
const e = idx.find(x => x.id === '20240115-demo');
assert.equal(e.id, '20240115-demo');
assert.equal(e.replyCount, 2);
assert.equal(e.cover, '/threads/20240115-demo/images/c.png', '相對路徑 cover 應解析為 /threads/<id>/<cover>');
assert.ok(!/[#*`\[\]]/.test(e.excerpt), 'excerpt 應為去 markdown 的純文字');
assert.ok(e.excerpt.startsWith('標題'), 'excerpt 內容: ' + e.excerpt);

const ext = idx.find(x => x.id === '20200801-external-cover');
assert.equal(ext.cover, 'https://res.cloudinary.com/demo/image/upload/x.jpg', '絕對 http(s) cover 應原樣輸出，不加 /threads/<id>/ 前綴');

console.log('build-index ok');
