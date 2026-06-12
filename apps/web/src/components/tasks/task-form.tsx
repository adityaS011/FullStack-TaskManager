"use client";

import { FormEvent, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  TaskFormFields,
  TaskFormState,
} from "@/components/tasks/task-form-fields";
import { TaskFormAttachments } from "@/components/tasks/task-form-attachments";
import { Button } from "@/components/ui/button";
import { cn, toDateInput } from "@/lib/utils";
import { FieldErrors, Task, TaskPayload } from "@/types/task";

const initialPayload: TaskFormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

type TaskFormProps = {
  task?: Task | null;
  saving: boolean;
  serverErrors: FieldErrors;
  className?: string;
  onCancel: () => void;
  onSubmit: (payload: TaskPayload, attachments: File[]) => Promise<void>;
};

export function TaskForm({ task, saving, serverErrors, className, onCancel, onSubmit }: TaskFormProps) {
  const [payload, setPayload] = useState<TaskFormState>(() => getInitialPayload(task));
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit({
      ...payload,
      dueDate: payload.dueDate
        ? new Date(`${payload.dueDate}T12:00:00.000Z`).toISOString()
        : "",
    }, attachments);
  }

  function addAttachments(files: File[]) {
    setAttachments((current) => [...current, ...files]);
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form className={cn("rounded-lg border border-border bg-surface p-4 shadow-sm", className)} onSubmit={submit}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{task ? "Edit task" : "Create task"}</h2>
          <p className="text-sm text-muted-foreground">Plan the next piece of work.</p>
        </div>
        <Button aria-label="Close form" title="Close form" variant="icon" onClick={onCancel}>
          <AppIcon name="close" size={17} />
        </Button>
      </div>
      <TaskFormFields
        payload={payload}
        errors={{ ...serverErrors, ...errors }}
        onChange={setPayload}
      />
      <div className="mt-4">
        <TaskFormAttachments
          disabled={saving}
          files={attachments}
          onAdd={addAttachments}
          onRemove={removeAttachment}
        />
      </div>
      <Button className="mt-4 w-full" disabled={saving} type="submit">
        <AppIcon className={saving ? "animate-spin" : ""} name={saving ? "loader" : "save"} size={16} />
        Save task
      </Button>
    </form>
  );
}

function validate(payload: TaskFormState) {
  const errors: FieldErrors = {};
  if (payload.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }
  if (payload.description.length > 1000) {
    errors.description = "Description must be 1000 characters or less.";
  }
  return errors;
}

function getInitialPayload(task?: Task | null): TaskFormState {
  if (!task) return initialPayload;
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: toDateInput(task.dueDate),
  };
}
