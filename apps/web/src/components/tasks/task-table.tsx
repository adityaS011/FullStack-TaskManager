"use client";

import { TaskActions } from "@/components/tasks/task-actions";
import { useOpenTask } from "@/components/tasks/use-open-task";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { Task } from "@/types/task";

type TaskTableProps = {
  tasks: Task[];
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
};

type TaskRowProps = Omit<TaskTableProps, "tasks"> & {
  task: Task;
};

export function TaskTable({ tasks, onComplete, onDelete, onEdit }: TaskTableProps) {
  return (
    <div className="hidden min-w-full overflow-x-auto md:block">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <Th className="w-[40%]">Task</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Due</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskRow({
  task,
  onComplete,
  onDelete,
  onEdit,
}: TaskRowProps) {
  const navigation = useOpenTask(task.id);

  return (
    <tr
      aria-label={`Open ${task.title}`}
      className="group cursor-pointer focus-visible:outline-none"
      role="link"
      tabIndex={0}
      onClick={navigation.onClick}
      onKeyDown={navigation.onKeyDown}
    >
      <Td>
        <div className="max-w-xl">
          <p className="font-semibold text-foreground transition group-hover:text-blue-700 group-focus-visible:text-blue-700 dark:group-hover:text-blue-200 dark:group-focus-visible:text-blue-200">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          )}
          {task.userEmail && <p className="mt-1 text-xs text-muted-foreground">{task.userEmail}</p>}
        </div>
      </Td>
      <Td><StatusBadge kind="status" value={task.status} /></Td>
      <Td><StatusBadge kind="priority" value={task.priority} /></Td>
      <Td className="whitespace-nowrap text-muted-foreground">{formatDate(task.dueDate)}</Td>
      <Td>
        <div className="flex justify-end">
          <TaskActions task={task} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
        </div>
      </Td>
    </tr>
  );
}

function Th({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <th className={`border-b border-border px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

function Td({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <td className={`border-b border-border px-4 py-3 align-top group-hover:bg-muted/50 group-focus-visible:bg-muted/50 ${className}`}>
      {children}
    </td>
  );
}
