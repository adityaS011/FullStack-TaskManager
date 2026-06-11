"use client";

import { cn } from "@/lib/utils";
import { TaskScope } from "@/types/task";

type TaskScopeToggleProps = {
  canViewAllTasks: boolean;
  scope: TaskScope;
  onScopeChange: (scope: TaskScope) => void;
};

const options: Array<{ label: string; value: TaskScope }> = [
  { label: "My tasks", value: "mine" },
  { label: "All users", value: "all" },
];

export function TaskScopeToggle({
  canViewAllTasks,
  scope,
  onScopeChange,
}: TaskScopeToggleProps) {
  if (!canViewAllTasks) return null;

  return (
    <section className="shrink-0 border-b border-border bg-surface/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
            Admin view
          </p>
          <p className="text-sm text-muted-foreground">Switch between your queue and every user&apos;s work.</p>
        </div>
        <div
          aria-label="Task visibility"
          className="inline-flex w-full rounded-md border border-border bg-background p-1 sm:w-auto"
          role="group"
        >
          {options.map((option) => {
            const active = option.value === scope;
            return (
              <button
                aria-pressed={active}
                className={cn(
                  "h-9 flex-1 rounded px-3 text-sm font-semibold transition sm:flex-none",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                key={option.value}
                type="button"
                onClick={() => onScopeChange(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
