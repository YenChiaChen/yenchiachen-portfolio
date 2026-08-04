import React, { useSyncExternalStore, useCallback } from 'react';

const listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, '', to);
  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit);
}

export function useRoute() {
  const path = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => window.location.pathname,
    () => '/',
  );
  return { path };
}

export function parseRoute(path: string) {
  if (path === '/' || path === '') return { name: 'home' as const };
  if (path === '/admin' || path === '/admin/') return { name: 'admin' as const };
  const m = path.match(/^\/thread\/([^/]+)\/?$/);
  if (m) return { name: 'thread' as const, id: decodeURIComponent(m[1]) };
  return { name: 'notfound' as const };
}

export const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> =
  ({ to, className, children }) => {
    const onClick = useCallback((e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // 允許新分頁
      e.preventDefault();
      navigate(to);
      window.scrollTo(0, 0);
    }, [to]);
    return <a href={to} className={className} onClick={onClick}>{children}</a>;
  };
