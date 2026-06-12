import {
  ActivityLog,
  AuthResponse,
  Task,
  TaskAttachment,
  TaskListParams,
  TaskListResponse,
  TaskPayload,
  TaskScope,
  User,
} from "@/types/task";

import { downloadBlob, request, websocketURL } from "@/lib/http";

export { ApiError } from "@/lib/http";

function queryString(params: TaskListParams) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: params.sort,
    direction: params.direction,
  });
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  return query.toString();
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  signup(name: string, email: string, password: string) {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  me(token: string) {
    return request<User>("/auth/me", { token });
  },
  getTask(id: string, token: string) {
    return request<Task>(`/tasks/${id}`, { token });
  },
  listTasks(params: TaskListParams, token: string, scope: TaskScope = "mine") {
    const path = scope === "all" ? "/admin/tasks" : "/tasks";
    return request<TaskListResponse>(`${path}?${queryString(params)}`, { token });
  },
  listTaskActivity(taskId: string, token: string) {
    return request<ActivityLog[]>(`/tasks/${taskId}/activity`, { token });
  },
  listTaskAttachments(taskId: string, token: string) {
    return request<TaskAttachment[]>(`/tasks/${taskId}/attachments`, { token });
  },
  uploadTaskAttachment(taskId: string, file: File, token: string) {
    const body = new FormData();
    body.append("file", file);
    return request<TaskAttachment>(`/tasks/${taskId}/attachments`, {
      method: "POST",
      token,
      body,
    });
  },
  downloadTaskAttachment(taskId: string, attachmentId: string, token: string) {
    return downloadBlob(`/tasks/${taskId}/attachments/${attachmentId}/download`, token);
  },
  deleteTaskAttachment(taskId: string, attachmentId: string, token: string) {
    return request<void>(`/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE", token });
  },
  createTask(payload: TaskPayload, token: string) {
    return request<Task>("/tasks", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updateTask(id: string, payload: TaskPayload, token: string) {
    return request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
  deleteTask(id: string, token: string) {
    return request<void>(`/tasks/${id}`, { method: "DELETE", token });
  },
  taskEventsURL(token: string) {
    return websocketURL("/ws/tasks", token);
  },
};
