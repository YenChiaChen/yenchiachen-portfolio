import React from 'react';
import type { ThreadIndexEntry } from '../utils/threads';
import { StatusBadge } from './StatusBadge';
import { Link } from '../utils/router';

export const ThreadCard: React.FC<{ entry: ThreadIndexEntry }> = ({ entry }) => (
  <Link to={`/thread/${entry.id}`} className="block group">
    <article className="py-6 border-b border-line">
      <div className="flex items-center gap-3 text-xs font-mono text-sub">
        <time>{entry.date}</time>
        <StatusBadge status={entry.status} />
        {entry.tags.map(t => <span key={t} className="text-accent">#{t}</span>)}
      </div>
      {entry.title && <h2 className="mt-2 font-serif text-xl text-ink group-hover:text-seal transition-colors">{entry.title}</h2>}
      <p className="mt-1 text-sub font-light line-clamp-2">{entry.excerpt}</p>
      {entry.replyCount > 0 && <p className="mt-2 text-xs font-mono text-sub">↳ {entry.replyCount} 則後續</p>}
    </article>
  </Link>
);
