import {
  ActivityLog,
  AuthResponse,
  FieldErrors,
  Task,
  TaskListParams,
  TaskListResponse,
  TaskPayload,
  TaskScope,
  User,
} from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fields?: FieldErrors;

  constructor(message: string, status: number, fields?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const apiError = body?.error;
    throw new ApiError(apiError?.message ?? "Request failed.", response.status, apiError?.fields);
  }
  return body as T;
}

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

function websocketURL(path: string, token: string) {
  const url = new URL(path, API_BASE_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
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
