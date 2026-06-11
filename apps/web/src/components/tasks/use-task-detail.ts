"use client";

import { useCallback, useEffect, useState } from "react";

import { useTaskRealtime } from "@/components/tasks/use-task-realtime";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { ActivityLog, Task } from "@/types/task";

type TaskDetailData = {
  activity: ActivityLog[];
  error: string;
  loading: boolean;
  task: Task | null;
};

export function useTaskDetail(taskId: string) {
  const { token } = useAuth();
  const [data, setData] = useState<TaskDetailData>({
    activity: [], error: "", loading: true, task: null,
  });

  const loadTask = useCallback(async (options?: { quiet?: boolean }) => {
    if (!token) return;
    setData((current) => ({
      ...current, error: "", loading: options?.quiet ? current.loading : true,
    }));
    try {
      const [task, activity] = await Promise.all([
        api.getTask(taskId, token),
        api.listTaskActivity(taskId, token),
      ]);
      setData({ activity, error: "", loading: false, task });
    } catch (err) {
      setData((current) => ({
        ...current,
        error: err instanceof ApiError ? err.message : "Unable to load task details.",
        loading: false,
      }));
    }
  }, [taskId, token]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  useTaskRealtime(token, (event) => {
    if (event.taskId === taskId) void loadTask({ quiet: true });
  });

  return data;
}
