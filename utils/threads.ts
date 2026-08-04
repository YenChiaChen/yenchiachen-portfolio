import { filterThreads as filterThreadsImpl } from './filter.mjs';

export type ThreadStatus = 'todo' | 'doing' | 'done';
export interface ThreadReply { date: string; body: string; images?: string[]; }
export interface Thread {
  id: string; date: string; title: string; tags: string[];
  status: ThreadStatus; body: string; cover?: string; replies: ThreadReply[];
}
export interface ThreadIndexEntry {
  id: string; date: string; title: string; tags: string[];
  status: ThreadStatus; excerpt: string; cover?: string; replyCount: number;
}

export const filterThreads: (
  entries: ThreadIndexEntry[],
  f: { tags: string[]; status: ThreadStatus | null }
) => ThreadIndexEntry[] = filterThreadsImpl;

export async function fetchIndex(): Promise<ThreadIndexEntry[]> {
  const res = await fetch('/data/index.json');
  if (!res.ok) throw new Error('index.json 載入失敗');
  return res.json();
}
export async function fetchThread(id: string): Promise<Thread> {
  const res = await fetch(`/threads/${id}/post.json`);
  if (!res.ok) throw new Error(`貼文 ${id} 載入失敗`);
  return res.json();
}
export function threadImageUrl(id: string, rel: string): string {
  if (rel.startsWith('http') || rel.startsWith('/')) return rel;
  return `/threads/${id}/${rel}`;
}
