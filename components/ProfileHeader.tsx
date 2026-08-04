import React from 'react';

export const ProfileHeader: React.FC = () => (
  <header className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
    <h1 className="font-serif text-3xl text-ink">陳彥家 Yen-Chia Chen</h1>
    <p className="mt-3 text-sub font-light">機器學習 × 全端 × 網球。這裡是我的人生編年史。</p>
    <nav className="mt-4 flex justify-center gap-5 text-xs font-mono uppercase tracking-widest text-sub">
      <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-seal">GitHub</a>
      <a href="mailto:charlisyenchiachen@gmail.com" className="hover:text-seal">Email</a>
    </nav>
  </header>
);
