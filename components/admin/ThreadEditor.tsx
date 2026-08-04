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
    if (into === 'body') setT(p => ({ ...p, id, body: `${p.body}\n\n![](/threads/${id}/${rel})\n` }));
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
