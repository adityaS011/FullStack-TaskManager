export type UserRole = "member" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type SortKey = "created_at" | "due_date" | "priority";
export type SortDirection = "asc" | "desc";

export type Task = {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
};

export type TaskListParams = {
  page: number;
  pageSize: number;
  status?: TaskStatus | "";
  q?: string;
  sort: SortKey;
  direction: SortDirection;
};

export type TaskListResponse = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type FieldErrors = Record<string, string>;
