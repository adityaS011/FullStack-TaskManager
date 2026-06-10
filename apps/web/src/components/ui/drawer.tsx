"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

type DrawerProps = {
  children: React.ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
};

export function Drawer({ children, open, title, onClose }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    // The drawer owns scrolling while open, avoiding the half-visible mobile form issue.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[90dvh] w-full overflow-y-auto bg-surface shadow-2xl",
          "rounded-t-2xl border-t border-border",
          "md:h-full md:max-h-none md:w-[440px] md:rounded-l-2xl md:rounded-tr-none md:border-l md:border-t-0",
        )}
        role="dialog"
      >
        {children}
      </section>
    </div>
  );
}
