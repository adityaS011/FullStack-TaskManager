"use client";

import { TaskFiltersState } from "@/components/tasks/task-filters";
import { TaskListResponse } from "@/types/task";

type TaskOverviewProps = {
  data: TaskListResponse;
  filters: TaskFiltersState;
};

export function TaskOverview({ data, filters }: TaskOverviewProps) {
  const filterLabel = filters.status ? filters.status.replace("_", " ") : "all tasks";
  const sortLabel = filters.sort.replace("_", " ");

  return (
    <section className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Vector Tasks</p>
          <h1 className="mt-1 text-2xl font-semibold">Track your tasks with ease</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, prioritize, and move work forward without losing the list.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric label="Total" value={String(data.total)} />
          <Metric label="Showing" value={filterLabel} />
          <Metric label="Sorted by" value={sortLabel} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold capitalize">{value}</p>
    </div>
  );
}
