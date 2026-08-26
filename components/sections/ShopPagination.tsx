import { ChevronLeft, ChevronRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const withEllipsis: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) withEllipsis.push("ellipsis");
    withEllipsis.push(page);
    previous = page;
  }
  return withEllipsis;
}

export function ShopPagination({
  currentPage,
  totalPages,
  buildHref,
  previousLabel,
  nextLabel,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => { pathname: "/shop"; query: Record<string, string> };
  previousLabel: string;
  nextLabel: string;
}) {
  const pages = pageNumbers(currentPage, totalPages);
  const linkClass =
    "flex items-center gap-1 border border-border/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted";

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className={linkClass}>
          <ChevronLeft className="size-4 rtl:rotate-180" />
          <span className="hidden sm:inline">{previousLabel}</span>
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4 rtl:rotate-180" />
          <span className="hidden sm:inline">{previousLabel}</span>
        </span>
      )}

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center border text-sm transition-colors",
              page === currentPage
                ? "border-gold-500 bg-gold-100 font-medium text-gold-700"
                : "border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)} className={linkClass}>
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight className="size-4 rtl:rotate-180" />
        </span>
      )}
    </nav>
  );
}
