"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { ActivityTimeline } from "@/components/tasks/activity-timeline";
import { useTaskDetail } from "@/components/tasks/use-task-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";

type TaskDetailPageProps = {
  taskId: string;
};

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const { activity, error, loading, task } = useTaskDetail(taskId);

  if (loading) {
    return (
      <div className="grid h-full place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AppIcon className="animate-spin" name="loader" size={18} />
          Loading task
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BackLink />
        <section className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error || "Task was not found."}
        </section>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <BackLink />
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                Task details
              </p>
              <h1 className="mt-2 break-words text-2xl font-semibold">{task.title}</h1>
              {task.description && (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="status" value={task.status} />
              <StatusBadge kind="priority" value={task.priority} />
            </div>
          </div>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Due date" value={formatDate(task.dueDate)} />
            <Meta label="Owner" value={task.userEmail || "You"} />
            <Meta label="Created" value={formatDateTime(task.createdAt)} />
            <Meta label="Updated" value={formatDateTime(task.updatedAt)} />
          </dl>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Timeline of changes recorded for this task.
            </p>
          </div>
          <ActivityTimeline logs={activity} />
        </section>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      href="/tasks"
    >
      <AppIcon name="chevron-left" size={16} />
      Back to tasks
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{value}</dd>
    </div>
  );
}
