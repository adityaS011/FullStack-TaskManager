"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskTable } from "@/components/tasks/task-table";
import { Task } from "@/types/task";

type TaskListProps = {
  error: string;
  loading: boolean;
  tasks: Task[];
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
};

export function TaskList({ error, loading, tasks, onComplete, onDelete, onEdit }: TaskListProps) {
  if (loading) {
    return (
      <section className="grid min-h-full place-items-center p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AppIcon className="animate-spin" name="loader" size={18} />
          Loading tasks
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
        {error}
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="grid min-h-full place-items-center p-8 text-center">
        <div>
          <AppIcon className="mx-auto text-muted-foreground" name="clipboard" size={38} />
          <h2 className="mt-4 text-lg font-semibold">No tasks found</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Create a task or adjust the current filters to bring work back into view.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      <TaskTable tasks={tasks} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
      <div className="grid gap-3 p-3 md:hidden">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}
