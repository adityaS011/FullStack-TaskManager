"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";

type TaskActionsProps = {
  task: Task;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
};

export function TaskActions({ task, onComplete, onDelete, onEdit }: TaskActionsProps) {
  const completed = task.status === "completed";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        aria-label="Mark complete"
        disabled={completed}
        title="Mark complete"
        variant="icon"
        onClick={() => onComplete(task)}
      >
        <AppIcon name="check" size={17} />
      </Button>
      <Button aria-label="Edit task" title="Edit task" variant="icon" onClick={() => onEdit(task)}>
        <AppIcon name="edit" size={17} />
      </Button>
      <Button aria-label="Delete task" title="Delete task" variant="icon" onClick={() => onDelete(task)}>
        <AppIcon name="trash" size={17} />
      </Button>
    </div>
  );
}
