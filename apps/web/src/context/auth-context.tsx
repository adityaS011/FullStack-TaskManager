"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { AuthResponse, User } from "@/types/task";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "vector.task.token";
const USER_KEY = "vector.task.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(TOKEN_KEY);
  });

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => setReady(true));
      return;
    }

    let active = true;
    // Refresh the saved user on page load so stale localStorage data cannot grant UI access forever.
    api
      .me(token)
      .then((freshUser) => {
        if (!active) return;
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        if (!active) return;
        clearSession();
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function storeSession(response: AuthResponse) {
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  function clearSession() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      login: async (email, password) => {
        storeSession(await api.login(email, password));
      },
      signup: async (name, email, password) => {
        storeSession(await api.signup(name, email, password));
      },
      logout: clearSession,
    }),
    [ready, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const savedUser = localStorage.getItem(USER_KEY);
  try {
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}
