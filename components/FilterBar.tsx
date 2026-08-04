import React, { useState } from 'react';
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
// 主類別標籤：永遠顯示且固定順序；其餘主題標籤收進「更多」。
const PRIMARY = ['作品', '文章', '經歷', '獎項'];

export const FilterBar: React.FC<Props> = ({ allTags, selectedTags, onToggleTag, selectedStatus, onSelectStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const chip = (active: boolean) =>
    `text-xs px-3 py-1 rounded-full border transition-colors ${active ? 'bg-ink text-bg border-ink' : 'border-line text-sub hover:border-ink'}`;

  const primary = PRIMARY.filter(t => allTags.includes(t));
  const rest = allTags.filter(t => !PRIMARY.includes(t)).sort();
  // 收合時仍要露出：主類別 + 目前已選的主題標籤
  const alwaysShown = [...primary, ...rest.filter(t => selectedTags.includes(t))];
  const hiddenCount = rest.filter(t => !selectedTags.includes(t)).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-4 flex flex-wrap gap-2 items-center border-y border-line sticky top-0 bg-bg/90 backdrop-blur z-20">
      {STATUSES.map(s => (
        <button key={s.key} className={chip(selectedStatus === s.key)}
          onClick={() => onSelectStatus(selectedStatus === s.key ? null : s.key)}>{s.label}</button>
      ))}
      <span className="w-px h-4 bg-line mx-1" />
      {alwaysShown.map(t => (
        <button key={t} className={chip(selectedTags.includes(t))} onClick={() => onToggleTag(t)}>#{t}</button>
      ))}
      {expanded && rest.filter(t => !selectedTags.includes(t)).map(t => (
        <button key={t} className={chip(false)} onClick={() => onToggleTag(t)}>#{t}</button>
      ))}
      {hiddenCount > 0 && (
        <button className="text-xs px-2 py-1 text-sub hover:text-ink font-mono"
          onClick={() => setExpanded(v => !v)}>
          {expanded ? '收合 ▴' : `更多標籤 (${hiddenCount}) ▾`}
        </button>
      )}
    </div>
  );
};
