// Logic: Sanitized Markdown rendering engine with XSS prevention and code block copying.
// Input: Raw Markdown text string.
// Output: Rendered HTML DOM with security attributes and copy controls.

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';

const markedInstance = new Marked();
markedInstance.use(
  markedKatex({
    throwOnError: false,
    nonStandard: true,
  })
);

// Logic: Basic HTML sanitizer stripping dangerous tags and inline scripts.
// Input: Raw HTML string.
// Output: Sanitized HTML string.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '#');
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    try {
      const rawHtml = markedInstance.parse(content, {
        gfm: true,
        breaks: true,
      }) as string;

      // Ensure all external anchor tags have rel="noopener noreferrer nofollow"
      const withSafeLinks = rawHtml.replace(
        /<a\s+([^>]*href=["']https?:\/\/[^"']+["'][^>]*)>/gi,
        (match) => {
          if (!match.includes('rel=')) {
            return match.replace('<a ', '<a rel="noopener noreferrer nofollow" target="_blank" ');
          }
          return match;
        }
      );

      return sanitizeHtml(withSafeLinks);
    } catch {
      return '<p class="text-rose-400">Lỗi biên dịch nội dung Markdown</p>';
    }
  }, [content]);

  // Attach copy buttons to pre code blocks
  useEffect(() => {
    if (!containerRef.current) return;
    const preBlocks = containerRef.current.querySelectorAll('pre');

    preBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className =
        'copy-btn absolute top-3 right-3 rounded bg-zinc-800/80 px-2 py-1 text-xs text-zinc-300 opacity-0 hover:bg-zinc-700 group-hover:opacity-100 transition-all font-mono';
      btn.innerText = 'Sao chép';

      pre.style.position = 'relative';
      pre.classList.add('group');

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          btn.innerText = 'Đã chép!';
          setTimeout(() => {
            btn.innerText = 'Sao chép';
          }, 2000);
        } catch {
          btn.innerText = 'Lỗi';
        }
      });

      pre.appendChild(btn);
    });
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className="eft-markdown max-w-none text-zinc-300"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
