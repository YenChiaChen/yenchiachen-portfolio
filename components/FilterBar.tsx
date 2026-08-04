import React from 'react';
import type { ThreadStatus } from '../utils/threads';

interface Props {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (t: string) => void;
  selectedStatus: ThreadStatus | null;
  onSelectStatus: (s: ThreadStatus | null) => void;
}
const STATUSES: { key: ThreadStatus; label: string }[] = [
  { key: 'todo', label: '想做' }, { key: 'doing', label: '進行中' }, { key: 'done', label: '完成' },
];

export const FilterBar: React.FC<Props> = ({ allTags, selectedTags, onToggleTag, selectedStatus, onSelectStatus }) => {
  const chip = (active: boolean) =>
    `text-xs px-3 py-1 rounded-full border transition-colors ${active ? 'bg-ink text-bg border-ink' : 'border-line text-sub hover:border-ink'}`;
  return (
    <div className="max-w-2xl mx-auto px-6 py-4 flex flex-wrap gap-2 items-center border-y border-line sticky top-0 bg-bg/90 backdrop-blur z-20">
      {STATUSES.map(s => (
        <button key={s.key} className={chip(selectedStatus === s.key)}
          onClick={() => onSelectStatus(selectedStatus === s.key ? null : s.key)}>{s.label}</button>
      ))}
      <span className="w-px h-4 bg-line mx-1" />
      {allTags.map(t => (
        <button key={t} className={chip(selectedTags.includes(t))} onClick={() => onToggleTag(t)}>#{t}</button>
      ))}
    </div>
  );
};
