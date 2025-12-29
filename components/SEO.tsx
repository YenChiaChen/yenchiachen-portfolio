
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

export const SEO: React.FC = () => {
  const { language } = useLanguage();

  const title = language === 'zh-TW' 
    ? '陳彥家 | 機器學習 x 全端 x 網球'
    : 'Yen-Chia Chen | ML x Full Stack x Tennis';
  
  const description = language === 'zh-TW'
    ? '受日式極簡美學啟發的個人作品集。展示機器學習工程與前端工藝的結合。'
    : 'A Japanese-inspired minimalist portfolio featuring light aesthetics, smooth parallax interactions, and modern typography.';

  const keywords = "Yen-Chia Chen, Machine Learning, Frontend Engineer, Portfolio, Minimalist, React, TypeScript, AI, Web Development";
  // Updated URL to custom domain
  const url = typeof window !== 'undefined' ? window.location.href : 'https://yenchia.tw/';
  const image = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2560&auto=format&fit=crop";

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Yen-Chia Chen" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={language === 'zh-TW' ? 'zh_TW' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
