import React from 'react';
import type { ThreadStatus } from '../utils/threads';

const MAP: Record<ThreadStatus, { label: string; cls: string }> = {
  todo:  { label: '想做',   cls: 'text-sub border-line' },
  doing: { label: '進行中', cls: 'text-accent border-accent/40' },
  done:  { label: '完成',   cls: 'text-seal border-seal/40' },
};

export const StatusBadge: React.FC<{ status: ThreadStatus }> = ({ status }) => {
  const s = MAP[status];
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${s.cls}`}>
      {s.label}
    </span>
  );
};
