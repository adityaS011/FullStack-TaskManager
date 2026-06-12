"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { ActivityTimeline } from "@/components/tasks/activity-timeline";
import { TaskDetailEditor } from "@/components/tasks/task-detail-editor";
import { TaskDetailSidebar } from "@/components/tasks/task-detail-sidebar";
import { useTaskDetail } from "@/components/tasks/use-task-detail";
import { formatDateTime } from "@/lib/utils";

type TaskDetailPageProps = {
  taskId: string;
};

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const { activity, attachments, error, loading, refresh, task } = useTaskDetail(taskId);

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
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <BackLink />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Task {task.id.slice(0, 8)}
            </span>
            <TaskDetailEditor task={task} onSaved={refresh} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0 rounded-lg border border-border bg-surface shadow-sm">
            <section className="border-b border-border px-4 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                Task request
              </p>
              <h1 className="mt-2 break-words text-2xl font-semibold">{task.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {task.userEmail || "You"} created this task {formatDateTime(task.createdAt)}
              </p>
              <div className="mt-4 min-h-5 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                {task.description || (
                  <span className="text-muted-foreground">No description provided.</span>
                )}
              </div>
            </section>
            <section className="px-4 py-4 sm:px-6">
              <div className="mb-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-6">
                  <span className="border-b-2 border-foreground pb-3 text-sm font-semibold">
                    Activity
                  </span>
                </div>
                <span className="pb-3 text-xs font-semibold text-muted-foreground">
                  {activity.length} events
                </span>
              </div>
              <ActivityTimeline logs={activity} />
            </section>
          </main>
          <TaskDetailSidebar
            attachments={attachments}
            task={task}
            onAttachmentsChanged={refresh}
          />
        </div>
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
