"use client";

import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { TaskAttachment } from "@/types/task";

type UseAttachmentActionsInput = {
  taskId: string;
  onChanged: () => Promise<void> | void;
};

export function useTaskAttachmentActions({ taskId, onChanged }: UseAttachmentActionsInput) {
  const { token } = useAuth();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    if (!token) return;
    setBusy("upload");
    setError("");
    try {
      await api.uploadTaskAttachment(taskId, file, token);
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to upload attachment.");
    } finally {
      setBusy("");
    }
  }

  async function downloadAttachment(attachment: TaskAttachment) {
    if (!token) return;
    setBusy(attachment.id);
    setError("");
    try {
      const blob = await api.downloadTaskAttachment(taskId, attachment.id, token);
      triggerDownload(blob, attachment.fileName);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to download attachment.");
    } finally {
      setBusy("");
    }
  }

  async function deleteAttachment(attachment: TaskAttachment) {
    if (!token) return false;
    setBusy(attachment.id);
    setError("");
    try {
      await api.deleteTaskAttachment(taskId, attachment.id, token);
      await onChanged();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete attachment.");
      return false;
    } finally {
      setBusy("");
    }
  }

  return {
    busy,
    clearError: () => setError(""),
    deleteAttachment,
    downloadAttachment,
    error,
    uploadFile,
  };
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
