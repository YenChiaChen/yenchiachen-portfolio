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
