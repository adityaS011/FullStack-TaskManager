"use client";

import { Dispatch, SetStateAction } from "react";

import { api, ApiError } from "@/lib/api";
import { FieldErrors, Task, TaskListResponse, TaskPayload } from "@/types/task";

type TaskMutationParams = {
  closeForm: () => void;
  data: TaskListResponse;
  editing: Task | null;
  loadTasks: () => Promise<void>;
  setData: Dispatch<SetStateAction<TaskListResponse>>;
  setError: Dispatch<SetStateAction<string>>;
  setSaving: Dispatch<SetStateAction<boolean>>;
  setServerErrors: Dispatch<SetStateAction<FieldErrors>>;
  token: string | null;
};

export function useTaskMutations({
  closeForm,
  data,
  editing,
  loadTasks,
  setData,
  setError,
  setSaving,
  setServerErrors,
  token,
}: TaskMutationParams) {
  async function saveTask(payload: TaskPayload, attachments: File[] = []) {
    if (!token) return;
    setSaving(true);
    setServerErrors({});
    let savedTask: Task | null = null;
    try {
      savedTask = editing
        ? await api.updateTask(editing.id, payload, token)
        : await api.createTask(payload, token);
      await uploadAttachments(savedTask.id, attachments, token);
      closeForm();
      await loadTasks();
    } catch (err) {
      if (savedTask) {
        closeForm();
        await loadTasks();
        setError(attachmentErrorMessage(err));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Unable to save task.");
      if (err instanceof ApiError) setServerErrors(err.fields ?? {});
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(task: Task) {
    if (!token || task.status === "completed") return;
    const previous = data.items;
    const items = previous.map((item) =>
      item.id === task.id ? { ...item, status: "completed" as const } : item,
    );
    setData({ ...data, items });
    try {
      await api.updateTask(task.id, { status: "completed" }, token);
    } catch {
      setData({ ...data, items: previous });
      setError("Could not mark the task complete.");
    }
  }

  async function deleteTask(task: Task) {
    if (!token) return;
    const previous = data.items;
    const items = previous.filter((item) => item.id !== task.id);
    setData({ ...data, items, total: Math.max(data.total - 1, 0) });
    try {
      await api.deleteTask(task.id, token);
    } catch {
      setData({ ...data, items: previous });
      setError("Could not delete the task.");
    }
  }

  return { completeTask, deleteTask, saveTask };
}

async function uploadAttachments(taskId: string, attachments: File[], token: string) {
  for (const file of attachments) {
    await api.uploadTaskAttachment(taskId, file, token);
  }
}

function attachmentErrorMessage(err: unknown) {
  const message = err instanceof ApiError ? err.message : "Unable to upload one or more attachments.";
  return `Task saved, but attachments could not be uploaded. ${message}`;
}
