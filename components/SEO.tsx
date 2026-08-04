import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps { title?: string; description?: string; image?: string; }

const DEFAULT_TITLE = '陳彥家 | 人生編年史';
const DEFAULT_DESC = '一條依時間排序的人生 thread：作品、學習、目標與生活紀錄。';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dcpzacz9d/image/upload/c_crop,w_1050,h_1300/v1766891265/%E6%9C%AA%E5%91%BD%E5%90%8D%E7%9A%84%E4%BD%9C%E5%93%81-1_2_uqfdws.webp';

export const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
  const t = title ? `${title}｜陳彥家` : DEFAULT_TITLE;
  const d = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const url = typeof window !== 'undefined' ? window.location.href : 'https://yenchia.tw/';
  return (
    <Helmet>
      <html lang="zh-TW" />
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="author" content="Yen-Chia Chen" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="zh_TW" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
};
