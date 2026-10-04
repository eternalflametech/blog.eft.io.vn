// Logic: Reusable pagination controls supporting query parameters, page windowing, and accessible navigation.
// Input: currentPage, totalPages, basePath, optional anchor, and optional extraParams.
// Output: Rendered semantic pagination component complying with EFT Dark Theme tokens.

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  anchor?: string;
  extraParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  anchor,
  extraParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(extraParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const query = params.toString();
    const hash = anchor ? `#${anchor}` : '';
    return query ? `${basePath}?${query}${hash}` : `${basePath}${hash}`;
  };

  // Generate pagination page numbers window with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-8"
      aria-label="Phân trang danh sách bài viết"
    >
      <div className="text-xs text-zinc-400 font-mono">
        Trang <span className="text-white font-semibold">{currentPage}</span> /{' '}
        <span className="text-white font-semibold">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-lg border border-zinc-850 bg-zinc-900 hover:border-violet-500/40 transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trang trước</span>
          </Link>
        ) : (
          <span
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-600 rounded-lg border border-zinc-900 bg-zinc-950 cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trang trước</span>
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-zinc-600 text-xs font-mono select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <Link
                key={p}
                href={buildUrl(p)}
                className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-medium rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white hover:border-violet-500/40'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-lg border border-zinc-850 bg-zinc-900 hover:border-violet-500/40 transition-colors"
            aria-label="Trang sau"
          >
            <span className="hidden sm:inline">Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-600 rounded-lg border border-zinc-900 bg-zinc-950 cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <span className="hidden sm:inline">Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
