"use client";

import { useCallback, useEffect, useState } from "react";

import { TaskFiltersState } from "@/components/tasks/task-filters";
import { useDebouncedValue } from "@/components/tasks/use-debounced-value";
import { useTaskMutations } from "@/components/tasks/use-task-mutations";
import { useTaskRealtime } from "@/components/tasks/use-task-realtime";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { FieldErrors, Task, TaskListResponse, TaskScope } from "@/types/task";

export const pageSize = 6;
export const initialFilters: TaskFiltersState = { q: "", status: "", sort: "created_at", direction: "desc" };

const emptyData: TaskListResponse = { items: [], total: 0, page: 1, pageSize, totalPages: 0 };

export function useTaskDashboard() {
  const { token, user } = useAuth();
  const canViewAllTasks = user?.role === "admin";
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TaskListResponse>(emptyData);
  const [editing, setEditing] = useState<Task | null>(null);
  const [scope, setScope] = useState<TaskScope>(() => canViewAllTasks ? "all" : "mine");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const debouncedSearch = useDebouncedValue(filters.q);
  const effectiveScope = canViewAllTasks ? scope : "mine";

  const loadTasks = useCallback(async (options?: { quiet?: boolean }) => {
    if (!token) return;
    if (!options?.quiet) setLoading(true);
    setError("");
    try {
      const result = await api.listTasks(
        { ...filters, q: debouncedSearch, page, pageSize }, token, effectiveScope,
      );
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load tasks.");
    } finally {
      if (!options?.quiet) setLoading(false);
    }
  }, [debouncedSearch, effectiveScope, filters, page, token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTasks]);

  useTaskRealtime(token, (event) => {
    if (effectiveScope === "all" || event.userId === user?.id) void loadTasks({ quiet: true });
  });

  function updateFilters(next: TaskFiltersState) {
    setFilters(next);
    setPage(1);
  }

  function updateScope(next: TaskScope) {
    if (!canViewAllTasks) return;
    setScope(next);
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

  const mutations = useTaskMutations({
    closeForm, data, editing, loadTasks, setData, setError, setSaving, setServerErrors, token,
  });

  return { canViewAllTasks, data, editing, error, filters, loading, page, scope: effectiveScope,
    saving, serverErrors, showForm, updateFilters, updateScope, setPage, openForm,
    closeForm, ...mutations };
}
