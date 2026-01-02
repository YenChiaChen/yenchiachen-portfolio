import React, { useMemo } from 'react';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
// 重要：務必引入 KaTeX 的 CSS，否則公式會顯示錯亂
import 'katex/dist/katex.min.css'; 

interface MarkdownRendererProps {
  content: string;
}

// Define the custom extension for [cite]Text[/cite] syntax
const citeExtension = {
  name: 'cite',
  level: 'inline' as const,
  start(src: string) { return src.match(/\[cite\]/)?.index; },
  tokenizer(src: string) {
    const rule = /^\[cite\](.*?)\[\/cite\]/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'cite',
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer(token: any) {
    return `<cite class="block text-right font-serif text-xs text-sub mt-2 tracking-widest not-italic opacity-80">— ${token.text}</cite>`;
  }
};


const youtubeExtension = {
  name: 'youtube',
  level: 'block' as const, // Treat as a block element
  start(src: string) { return src.match(/{%\s*youtube/)?.index; },
  tokenizer(src: string) {
    // Regex to match {%youtube videoId %} or {% youtube https://... %}
    // Captures the content inside the tag
    const rule = /^{%\s*youtube\s+([^\s}]+)\s*%}/;
    const match = rule.exec(src);
    
    if (match) {
      let videoId = match[1].trim();

      // Attempt to extract ID if it's a full URL
      // Supports: youtube.com/watch?v=ID, youtu.be/ID, etc.
      const urlMatch = videoId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }

      return {
        type: 'youtube',
        raw: match[0],
        videoId: videoId,
      };
    }
  },
  renderer(token: any) {
    return `
      <div class="w-full aspect-video my-12 rounded-sm overflow-hidden shadow-xl relative bg-black/5">
        <iframe 
          src="https://www.youtube.com/embed/${token.videoId}" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen 
          class="absolute inset-0 w-full h-full"
        ></iframe>
      </div>
    `;
  }
};

// 1. 設定 KaTeX 選項 (可選)
const katexOptions = {
  throwOnError: false, // 當公式語法錯誤時不拋出異常，而是顯示原始碼
  output: 'html' as const,      // 輸出為 html (適合在瀏覽器渲染)
};

// Configure marked globally
marked.setOptions({
  gfm: true,
  breaks: true,
});

// 2. 註冊擴充功能 (建議將 KaTeX 放在自定義擴充之前或之後皆可，通常並行不衝突)
marked.use(markedKatex(katexOptions));
marked.use({ extensions: [citeExtension, youtubeExtension] });

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Memoize parsing to prevent unnecessary computations on re-renders
  const htmlContent = useMemo(() => marked.parse(content), [content]);

  return (
    <div 
      // 注意：Tailwind 的 prose 有時會覆蓋 KaTeX 的字體樣式
      // 你可能需要在 global.css 或這裡微調 .katex 相關的樣式，但通常預設效果已足夠
      className="prose prose-ink prose-lg max-w-none 
                 prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink
                 prose-p:font-sans prose-p:font-light prose-p:leading-relaxed prose-p:text-sub
                 prose-blockquote:border-seal prose-blockquote:bg-seal/5 prose-blockquote:py-4 prose-blockquote:font-serif prose-blockquote:italic
                 prose-pre:bg-ink prose-pre:rounded-none prose-pre:p-6
                 prose-code:text-seal prose-code:bg-seal/5 prose-code:px-1 prose-code:rounded-sm
                 prose-img:rounded-sm prose-img:shadow-2xl prose-img:my-12
                 prose-ul:list-disc prose-li:marker:text-seal
                 
                 /* Table Styles */
                 prose-table:w-full prose-table:text-left prose-table:border-collapse prose-table:my-8
                 prose-th:font-mono prose-th:text-[10px] prose-th:uppercase prose-th:tracking-widest prose-th:font-bold prose-th:text-ink prose-th:border-b-2 prose-th:border-seal/20 prose-th:pb-3 prose-th:p-2
                 prose-td:font-sans prose-td:text-sm prose-td:text-sub prose-td:border-b prose-td:border-line prose-td:py-3 prose-td:p-2 prose-td:align-top
                 prose-tr:hover:bg-line/20 prose-tr:transition-colors"
      dangerouslySetInnerHTML={{ __html: htmlContent as string }}
    />
  );
};