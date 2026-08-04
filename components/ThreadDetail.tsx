import React, { useEffect, useState } from 'react';
import { fetchThread, threadImageUrl, type Thread } from '../utils/threads';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StatusBadge } from './StatusBadge';
import { SEO } from './SEO';
import { Link } from '../utils/router';

export const ThreadDetail: React.FC<{ id: string }> = ({ id }) => {
  const [post, setPost] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPost(null); setError(null);
    fetchThread(id).then(setPost).catch(e => setError(String(e)));
  }, [id]);

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16"><Link to="/" className="text-seal">← 回時間軸</Link><p className="mt-8 text-seal">載入失敗：{error}</p></div>;
  if (!post) return <div className="max-w-2xl mx-auto px-6 py-16 text-sub">載入中…</div>;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SEO title={post.title || post.date} description={post.body.slice(0, 100)}
        image={post.cover ? threadImageUrl(post.id, post.cover) : undefined} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="text-xs font-mono uppercase tracking-widest text-sub hover:text-seal">← 回時間軸</Link>
        <div className="mt-6 flex items-center gap-3 text-xs font-mono text-sub">
          <time>{post.date}</time><StatusBadge status={post.status} />
          {post.tags.map(t => <span key={t} className="text-accent">#{t}</span>)}
        </div>
        {post.title && <h1 className="mt-2 font-serif text-3xl text-ink">{post.title}</h1>}
        <div className="mt-6"><MarkdownRenderer content={post.body} /></div>

        {post.replies.length > 0 && (
          <section className="mt-12 border-t border-line pt-8 space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sub">後續 · {post.replies.length}</h2>
            {post.replies.map((r, i) => (
              <div key={i} className="pl-4 border-l-2 border-seal/30">
                <time className="text-xs font-mono text-sub">{r.date}</time>
                <div className="mt-2"><MarkdownRenderer content={r.body} /></div>
                {r.images?.map((img, j) => (
                  <img key={j} src={threadImageUrl(post.id, img)} alt="" className="mt-3 rounded-sm shadow" />
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
