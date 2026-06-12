"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { TaskAttachment } from "@/types/task";

type AttachmentRowProps = {
  attachment: TaskAttachment;
  busy: boolean;
  onDelete: (attachment: TaskAttachment) => void;
  onDownload: (attachment: TaskAttachment) => void;
};

export function AttachmentRow({
  attachment,
  busy,
  onDelete,
  onDownload,
}: AttachmentRowProps) {
  return (
    <li className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 rounded-md border border-border bg-surface p-1.5 text-blue-700 dark:text-blue-200">
          <AppIcon name="file" size={16} />
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold">{attachment.fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatBytes(attachment.sizeBytes)} | {attachment.uploaderEmail} |{" "}
            {formatDateTime(attachment.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label={`Download ${attachment.fileName}`}
          className="h-8 w-8"
          disabled={busy}
          title="Download"
          variant="icon"
          onClick={() => onDownload(attachment)}
        >
          <AppIcon
            className={busy ? "animate-spin" : ""}
            name={busy ? "loader" : "download"}
            size={17}
          />
        </Button>
        <Button
          aria-label={`Delete ${attachment.fileName}`}
          className="h-8 w-8"
          disabled={busy}
          title="Delete"
          variant="icon"
          onClick={() => onDelete(attachment)}
        >
          <AppIcon name="trash" size={17} />
        </Button>
      </div>
    </li>
  );
}
