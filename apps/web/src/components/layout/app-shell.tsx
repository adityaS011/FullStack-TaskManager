"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, router, user]);

  if (!ready || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </main>
    );
  }

  function signOut() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b border-border bg-surface/95 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 text-white">
              <AppIcon name="clipboard" size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold">Vector Tasks</p>
              <p className="text-xs text-muted-foreground">
                {user.name} {user.role === "admin" ? "(admin)" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={signOut}>
              <AppIcon name="logout" size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </main>
  );
}
