import React from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Configure marked for all features
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const htmlContent = marked.parse(content);

  return (
    <div 
      className="prose prose-ink prose-lg max-w-none 
                 prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink
                 prose-p:font-sans prose-p:font-light prose-p:leading-relaxed prose-p:text-sub
                 prose-blockquote:border-seal prose-blockquote:bg-seal/5 prose-blockquote:py-4 prose-blockquote:font-serif prose-blockquote:italic
                 prose-pre:bg-ink prose-pre:rounded-none prose-pre:p-6
                 prose-code:text-seal prose-code:bg-seal/5 prose-code:px-1 prose-code:rounded-sm
                 prose-img:rounded-sm prose-img:shadow-2xl prose-img:my-12
                 prose-ul:list-disc prose-li:marker:text-seal
                 prose-th:font-mono prose-th:text-[10px] prose-th:uppercase prose-th:tracking-widest"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};