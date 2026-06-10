"use client";

import { useCallback, useEffect, useState } from "react";

import { TaskFiltersState } from "@/components/tasks/task-filters";
import { useDebouncedValue } from "@/components/tasks/use-debounced-value";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { FieldErrors, Task, TaskListResponse, TaskPayload } from "@/types/task";

export const pageSize = 6;
export const initialFilters: TaskFiltersState = {
  q: "", status: "", sort: "created_at", direction: "desc",
};

const emptyData: TaskListResponse = {
  items: [], total: 0, page: 1, pageSize, totalPages: 0,
};

export function useTaskDashboard() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TaskListResponse>(emptyData);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const debouncedSearch = useDebouncedValue(filters.q);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.listTasks({ ...filters, q: debouncedSearch, page, pageSize }, token);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, page, token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTasks]);

  async function saveTask(payload: TaskPayload) {
    if (!token) return;
    setSaving(true);
    setServerErrors({});
    try {
      if (editing) await api.updateTask(editing.id, payload, token);
      else await api.createTask(payload, token);
      closeForm();
      await loadTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save task.");
      if (err instanceof ApiError) setServerErrors(err.fields ?? {});
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(task: Task) {
    if (!token || task.status === "completed") return;
    const previous = data.items;
    // Optimistic update keeps the UI fast; the previous list is restored if the API rejects it.
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
    // Deletion is optimistic as well, with rollback preserving the exact prior page order.
    const items = previous.filter((item) => item.id !== task.id);
    setData({ ...data, items, total: Math.max(data.total - 1, 0) });
    try {
      await api.deleteTask(task.id, token);
    } catch {
      setData({ ...data, items: previous });
      setError("Could not delete the task.");
    }
  }

  function updateFilters(next: TaskFiltersState) {
    setFilters(next);
    setPage(1);
  }

  function openForm(task?: Task) {
    setEditing(task ?? null);
    setShowForm(true);
    setServerErrors({});
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return { filters, updateFilters, page, setPage, data, editing, showForm, loading, saving,
    error, serverErrors, saveTask, completeTask, deleteTask, openForm, closeForm };
}
