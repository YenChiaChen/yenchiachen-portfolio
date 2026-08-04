import React, { useEffect, useMemo, useState } from 'react';
import { fetchIndex, filterThreads, type ThreadIndexEntry, type ThreadStatus } from '../utils/threads';
import { ProfileHeader } from './ProfileHeader';
import { FilterBar } from './FilterBar';
import { ThreadCard } from './ThreadCard';
import { FeaturedStrip } from './FeaturedStrip';
import { SEO } from './SEO';

export const Timeline: React.FC = () => {
  const [entries, setEntries] = useState<ThreadIndexEntry[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ThreadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchIndex().then(setEntries).catch(e => setError(String(e))); }, []);

  const allTags = useMemo(
    () => entries ? [...new Set(entries.flatMap(e => e.tags))].sort() : [],
    [entries]);
  const shown = useMemo(
    () => entries ? filterThreads(entries, { tags, status }) : [],
    [entries, tags, status]);
  const featured = useMemo(
    () => entries ? entries.filter(e => e.featured) : [],
    [entries]);

  const filtering = tags.length > 0 || status !== null;
  const toggleTag = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SEO />
      <ProfileHeader />
      {!filtering && <FeaturedStrip entries={featured} />}
      {entries && <FilterBar allTags={allTags} selectedTags={tags} onToggleTag={toggleTag}
        selectedStatus={status} onSelectStatus={setStatus} />}
      <main className="max-w-2xl mx-auto px-6">
        {error && <p className="py-12 text-seal">載入失敗：{error}</p>}
        {!entries && !error && <p className="py-12 text-sub">載入中…</p>}
        {shown.map(e => <ThreadCard key={e.id} entry={e} />)}
        {entries && shown.length === 0 && <p className="py-12 text-sub">沒有符合的貼文。</p>}
      </main>
    </div>
  );
};
