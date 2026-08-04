import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useRoute, parseRoute } from './utils/router';
import { Timeline } from './components/Timeline';
import { ThreadDetail } from './components/ThreadDetail';
import { AdminApp } from './components/admin/AdminApp';

export default function App() {
  const { path } = useRoute();
  const route = parseRoute(path);
  return (
    <HelmetProvider>
      {route.name === 'thread' ? <ThreadDetail id={route.id} />
        : route.name === 'admin' ? <AdminApp />
        : /* 'home' 或 'notfound' 皆退回時間軸 */ <Timeline />}
    </HelmetProvider>
  );
}
