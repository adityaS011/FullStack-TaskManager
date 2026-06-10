"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (total === 0) return null;
  return (
    <div className="shrink-0 border-t border-border bg-surface/95 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)} | {total} task{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Previous page"
          disabled={page <= 1}
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
        >
          <AppIcon name="chevron-left" size={16} />
          Previous
        </Button>
        <Button
          aria-label="Next page"
          disabled={page >= totalPages}
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <AppIcon name="chevron-right" size={16} />
        </Button>
      </div>
      </div>
    </div>
  );
}
