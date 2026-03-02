"use client";

/**
 * Pagination component with page size selector.
 *
 * Uses shadcn/ui primitives and syncs state with URL search params:
 * - `page` – current page (1-based)
 * - `page_size` – rows per page (10, 20, or 50)
 *
 * Preserves other search params when navigating or changing page size.
 * Changing page size resets to page 1.
 *
 * @example
 * ```tsx
 * <Pagination total={100} page={2} pageSize={10} />
 * ```
 */
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export interface PaginationProps {
  /** Total number of items across all pages */
  total: number;
  /** Current page (1-based) */
  page: number;
  /** Number of items per page (10, 20, or 50) */
  pageSize: number;
}

export default function Pagination({ total, page, pageSize }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const totalPages = Math.ceil(total / pageSize) || 1;

  const buildHref = (targetPage: number, targetPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    params.set("page_size", String(targetPageSize ?? pageSize));
    return `${pathname}?${params.toString()}`;
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("page_size", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;
  const currentPageSize = PAGE_SIZE_OPTIONS.includes(
    pageSize as (typeof PAGE_SIZE_OPTIONS)[number]
  )
    ? pageSize
    : PAGE_SIZE_OPTIONS[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-medium text-sm text-secondary">
        Total {total} item{total > 1 ? "s" : ""}
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-copy">Rows per page</span>
          <Select
            value={String(currentPageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-9 border-2 border-border-default/75 w-[70px] rounded-lg text-sm px-2" size="sm">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-sm font-semibold">
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <PaginationRoot className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              {hasPrevious ? (
                <PaginationLink href={buildHref(page - 1)} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </PaginationLink>
              ) : (
                <span
                  className="pointer-events-none flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground"
                  aria-disabled
                >
                  <ChevronLeft className="size-4" />
                </span>
              )}
            </PaginationItem>

            {visiblePages[0] > 1 && (
              <PaginationItem>
                <PaginationLink href={buildHref(1)}>1</PaginationLink>
              </PaginationItem>
            )}
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {visiblePages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href={buildHref(p)} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <PaginationItem>
                <PaginationLink href={buildHref(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              {hasNext ? (
                <PaginationLink href={buildHref(page + 1)} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </PaginationLink>
              ) : (
                <span
                  className="pointer-events-none flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground"
                  aria-disabled
                >
                  <ChevronRight className="size-4" />
                </span>
              )}
            </PaginationItem>
          </PaginationContent>
        </PaginationRoot>
      </div>
    </div>
  );
}
