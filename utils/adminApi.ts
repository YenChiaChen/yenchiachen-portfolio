import type { Thread } from './threads';

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}
export const adminApi = {
  saveThread: (thread: Thread) => post('/api/thread', { thread }),
  deleteThread: (id: string) => post('/api/thread/delete', { id }),
  publish: (message?: string) => post('/api/publish', { message }) as Promise<{ ok: boolean; error?: string; log?: string; count?: number }>,
  async uploadImage(id: string, file: File): Promise<string> {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file);
    });
    const safeName = `${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
    const out = await post('/api/upload', { id, filename: safeName, dataUrl });
    return out.path as string; // 'images/xxx'
  },
};
