"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Select, SelectOption } from "@/components/ui/select";
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

const statusOptions: SelectOption[] = [
  { label: "All", value: "" },
  { label: "Todo", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const sortOptions: SelectOption[] = [
  { label: "Created", value: "created_at" },
  { label: "Due date", value: "due_date" },
  { label: "Priority", value: "priority" },
];

const directionOptions: SelectOption[] = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

export function TaskFilters({ filters, onChange, onCreate }: TaskFiltersProps) {
  return (
    <section className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <AppIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            name="search"
            size={16}
          />
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
            options={statusOptions}
            value={filters.status}
            onValueChange={(status) => onChange({ ...filters, status: status as TaskStatus | "" })}
          />
          <Select
            aria-label="Sort tasks"
            options={sortOptions}
            value={filters.sort}
            onValueChange={(sort) => onChange({ ...filters, sort: sort as SortKey })}
          />
          <Select
            aria-label="Sort direction"
            options={directionOptions}
            value={filters.direction}
            onValueChange={(direction) => onChange({ ...filters, direction: direction as SortDirection })}
          />
          <Button onClick={onCreate}>
            <AppIcon name="plus" size={16} />
            New
          </Button>
        </div>
      </div>
    </section>
  );
}
