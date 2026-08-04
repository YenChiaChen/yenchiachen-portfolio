import assert from 'node:assert';
import { filterThreads } from '../utils/filter.mjs';

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
