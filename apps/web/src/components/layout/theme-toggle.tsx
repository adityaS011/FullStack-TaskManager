"use client";

import { useEffect, useSyncExternalStore } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";

const THEME_KEY = "vector.task.theme";
const THEME_EVENT = "vector-theme-change";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light");
  const dark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleTheme() {
    localStorage.setItem(THEME_KEY, dark ? "light" : "dark");
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <Button aria-label="Toggle theme" title="Toggle theme" variant="icon" onClick={toggleTheme}>
      <AppIcon name={dark ? "sun" : "moon"} />
    </Button>
  );
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getThemeSnapshot() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
