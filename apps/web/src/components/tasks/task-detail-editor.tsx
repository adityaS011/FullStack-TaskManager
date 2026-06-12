"use client";

import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { FieldErrors, Task, TaskPayload } from "@/types/task";

type TaskDetailEditorProps = {
  task: Task;
  onSaved: () => Promise<void> | void;
};

export function TaskDetailEditor({ task, onSaved }: TaskDetailEditorProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  function openEditor() {
    setFormError("");
    setServerErrors({});
    setOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setOpen(false);
    setServerErrors({});
  }

  async function saveTask(payload: TaskPayload, attachments: File[]) {
    if (!token) return;
    setSaving(true);
    setFormError("");
    setServerErrors({});

    let savedTask: Task | null = null;
    try {
      savedTask = await api.updateTask(task.id, payload, token);
      await uploadAttachments(savedTask.id, attachments, token);
      setOpen(false);
      await onSaved();
    } catch (err) {
      if (savedTask) {
        setOpen(false);
        await onSaved();
        setFormError(attachmentErrorMessage(err));
        return;
      }
      setFormError(err instanceof ApiError ? err.message : "Unable to update task.");
      if (err instanceof ApiError) setServerErrors(err.fields ?? {});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="secondary" onClick={openEditor}>
        <AppIcon name="edit" size={16} />
        Edit
      </Button>
      {formError ? (
        <p className="max-w-xs text-right text-xs font-medium text-rose-600" role="alert">
          {formError}
        </p>
      ) : null}
      <Drawer open={open} title="Edit task" onClose={closeEditor}>
        <TaskForm
          key={task.id}
          className="min-h-full rounded-none border-0 shadow-none"
          task={task}
          saving={saving}
          serverErrors={serverErrors}
          onCancel={closeEditor}
          onSubmit={saveTask}
        />
      </Drawer>
    </div>
  );
}

async function uploadAttachments(taskId: string, attachments: File[], token: string) {
  for (const file of attachments) {
    await api.uploadTaskAttachment(taskId, file, token);
  }
}

function attachmentErrorMessage(err: unknown) {
  const message = err instanceof ApiError ? err.message : "Unable to upload attachments.";
  return `Task saved, but attachments could not be uploaded. ${message}`;
}
