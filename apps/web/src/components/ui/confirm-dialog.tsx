"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogVariant = "primary" | "danger";

type ConfirmDialogProps = {
  busy?: boolean;
  confirmLabel: string;
  description: string;
  open: boolean;
  title: string;
  variant?: ConfirmDialogVariant;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  busy = false,
  confirmLabel,
  description,
  open,
  title,
  variant = "primary",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    // Keep the background fixed while the confirmation requires a decision.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-4 py-6">
      <button
        aria-label="Cancel confirmation"
        className="absolute inset-0 bg-slate-950/45"
        disabled={busy}
        onClick={onCancel}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-2xl"
        role="alertdialog"
      >
        <div className="space-y-2">
          <h2 id="confirm-dialog-title" className="break-words text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p id="confirm-dialog-description" className="break-words text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button autoFocus disabled={busy} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={busy} variant={variant} onClick={onConfirm}>
            {busy ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
