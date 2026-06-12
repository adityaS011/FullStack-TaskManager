"use client";

import { ChangeEvent, useRef, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { AttachmentRow } from "@/components/tasks/task-attachment-row";
import { useTaskAttachmentActions } from "@/components/tasks/use-task-attachment-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskAttachment } from "@/types/task";

type TaskAttachmentsProps = {
  attachments: TaskAttachment[];
  taskId: string;
  onChanged: () => Promise<void> | void;
};

const acceptedTypes = [
  "image/*",
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
].join(",");

export function TaskAttachments({ attachments, taskId, onChanged }: TaskAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<TaskAttachment | null>(null);
  const { busy, clearError, deleteAttachment, downloadAttachment, error, uploadFile } =
    useTaskAttachmentActions({ taskId, onChanged });
  const pendingDeleteName = pendingDelete?.fileName ?? "this attachment";
  const deleteDescription = pendingDelete && error ? error : `Delete ${pendingDeleteName} from this task?`;

  function uploadSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(file);
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attachments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {attachments.length} {attachments.length === 1 ? "file" : "files"}
          </p>
        </div>
        <input
          ref={inputRef}
          accept={acceptedTypes}
          className="hidden"
          type="file"
          onChange={uploadSelected}
        />
        <Button disabled={busy === "upload"} onClick={() => inputRef.current?.click()}>
          <AppIcon
            className={busy === "upload" ? "animate-spin" : ""}
            name={busy === "upload" ? "loader" : "paperclip"}
          />
          {busy === "upload" ? "Uploading" : "Upload"}
        </Button>
      </div>
      {error && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}
      {attachments.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
          No attachments yet.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-background">
          {attachments.map((attachment) => (
            <AttachmentRow
              attachment={attachment}
              busy={busy === attachment.id}
              key={attachment.id}
              onDelete={(nextAttachment) => {
                clearError();
                setPendingDelete(nextAttachment);
              }}
              onDownload={downloadAttachment}
            />
          ))}
        </ul>
      )}
      <ConfirmDialog
        busy={busy === pendingDelete?.id}
        confirmLabel="Delete"
        description={deleteDescription}
        open={Boolean(pendingDelete)}
        title="Delete attachment"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          void deleteAttachment(pendingDelete).then((deleted) => {
            if (deleted) setPendingDelete(null);
          });
        }}
      />
    </section>
  );
}
