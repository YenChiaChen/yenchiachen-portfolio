
import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

// Define the custom extension for [cite]Text[/cite] syntax
const citeExtension = {
  name: 'cite',
  level: 'inline' as const, // Scan inside inline text
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
    // Renders a styled citation: Block display, Right aligned, Serif font, Subtle color
    return `<cite class="block text-right font-serif text-xs text-sub mt-2 tracking-widest not-italic opacity-80">— ${token.text}</cite>`;
  }
};

// Configure marked globally
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Register the extension
marked.use({ extensions: [citeExtension] });

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Memoize parsing to prevent unnecessary computations on re-renders
  const htmlContent = useMemo(() => marked.parse(content), [content]);

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
                 
                 /* Table Styles */
                 prose-table:w-full prose-table:text-left prose-table:border-collapse prose-table:my-8
                 prose-th:font-mono prose-th:text-[10px] prose-th:uppercase prose-th:tracking-widest prose-th:font-bold prose-th:text-ink prose-th:border-b-2 prose-th:border-seal/20 prose-th:pb-3 prose-th:p-2
                 prose-td:font-sans prose-td:text-sm prose-td:text-sub prose-td:border-b prose-td:border-line prose-td:py-3 prose-td:p-2 prose-td:align-top
                 prose-tr:hover:bg-line/20 prose-tr:transition-colors"
      dangerouslySetInnerHTML={{ __html: htmlContent as string }}
    />
  );
};
