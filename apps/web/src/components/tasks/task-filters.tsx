"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { SortDirection, SortKey, TaskStatus } from "@/types/task";

export type TaskFiltersState = {
  q: string;
  status: TaskStatus | "";
  sort: SortKey;
  direction: SortDirection;
};

type TaskFiltersProps = {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  onCreate: () => void;
};

export function TaskFilters({ filters, onChange, onCreate }: TaskFiltersProps) {
  return (
    <section className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="relative min-w-0 flex-1 lg:max-w-md">
        <AppIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" name="search" size={16} />
        <Input
          className="w-full pl-9"
          placeholder="Search by title"
          value={filters.q}
          onChange={(event) => onChange({ ...filters, q: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          aria-label="Filter status"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as TaskStatus | "" })}
        >
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </Select>
        <Select
          aria-label="Sort tasks"
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
        >
          <option value="created_at">Created</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
        </Select>
        <Select
          aria-label="Sort direction"
          value={filters.direction}
          onChange={(event) => onChange({ ...filters, direction: event.target.value as SortDirection })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
        <Button onClick={onCreate}>
          <AppIcon name="plus" size={16} />
          New
        </Button>
      </div>
      </div>
    </section>
  );
}
