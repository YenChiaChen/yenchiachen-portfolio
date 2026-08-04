import React from 'react';
import type { ThreadIndexEntry } from '../utils/threads';
import { Link } from '../utils/router';

export const FeaturedStrip: React.FC<{ entries: ThreadIndexEntry[] }> = ({ entries }) => {
  if (entries.length === 0) return null;
  return (
    <section className="max-w-2xl mx-auto px-6 pt-2 pb-8">
      <h2 className="text-xs font-mono uppercase tracking-widest text-seal mb-4">★ 精選 · 代表作</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map(e => (
          <Link key={e.id} to={`/thread/${e.id}`} className="block group">
            <article className="h-full flex flex-col border border-line bg-surface rounded-sm overflow-hidden hover:border-seal/40 transition-colors">
              {e.cover && (
                <div className="aspect-[16/9] overflow-hidden bg-line/30">
                  <img src={e.cover} alt="" loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
              )}
              <div className="flex flex-col flex-grow p-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-sub">
                  <time>{e.date}</time>
                  {e.tags.slice(0, 2).map(t => <span key={t} className="text-accent">#{t}</span>)}
                </div>
                <h3 className="mt-1 font-serif text-lg leading-snug text-ink group-hover:text-seal transition-colors">
                  {e.title || e.excerpt.slice(0, 24)}
                </h3>
                {e.replyCount > 0 && (
                  <p className="mt-auto pt-2 text-[10px] font-mono text-sub">↳ {e.replyCount} 則後續</p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};
