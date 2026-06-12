"use client";

import { TaskActions } from "@/components/tasks/task-actions";
import { useOpenTask } from "@/components/tasks/use-open-task";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
};

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const navigation = useOpenTask(task.id);

  return (
    <article
      aria-label={`Open ${task.title}`}
      className="group cursor-pointer rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-blue-200 hover:bg-muted/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:border-blue-900"
      role="link"
      tabIndex={0}
      onClick={navigation.onClick}
      onKeyDown={navigation.onKeyDown}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-base font-semibold transition group-hover:text-blue-700 dark:group-hover:text-blue-200">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
        <TaskActions task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge kind="status" value={task.status} />
        <StatusBadge kind="priority" value={task.priority} />
        <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {formatDate(task.dueDate)}
        </span>
        {task.userEmail && (
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {task.userEmail}
          </span>
        )}
      </div>
    </article>
  );
}
