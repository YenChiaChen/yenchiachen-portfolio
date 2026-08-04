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
