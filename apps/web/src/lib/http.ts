import { FieldErrors } from "@/types/task";

const LOCAL_API_BASE_URL = "http://localhost:8080";
const DEPLOYED_CONFIG_ERROR =
  "Missing NEXT_PUBLIC_API_BASE_URL. Set it to the deployed API URL and redeploy the web service.";
const configuredAPIBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

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

export async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${getAPIBaseURL()}${path}`, { ...options, headers });
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

export async function downloadBlob(path: string, token: string) {
  const response = await fetch(`${getAPIBaseURL()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const apiError = body?.error;
    throw new ApiError(apiError?.message ?? "Download failed.", response.status, apiError?.fields);
  }
  return response.blob();
}

export function websocketURL(path: string, token: string) {
  const url = new URL(path, getAPIBaseURL());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

export function resolveAPIBaseURL(configured = configuredAPIBaseURL, hostname = currentHostname()) {
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (isLocalHost(hostname)) {
    return LOCAL_API_BASE_URL;
  }
  throw new ApiError(DEPLOYED_CONFIG_ERROR, 500);
}

function getAPIBaseURL() {
  return resolveAPIBaseURL();
}

function currentHostname() {
  return typeof window === "undefined" ? "" : window.location.hostname;
}

function isLocalHost(hostname: string) {
  return hostname === "" || hostname === "localhost" || hostname === "127.0.0.1";
}
