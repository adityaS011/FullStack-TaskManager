"use client";

import { ChangeEvent, useRef } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { acceptedAttachmentTypes } from "@/components/tasks/attachment-config";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

type TaskFormAttachmentsProps = {
  disabled?: boolean;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export function TaskFormAttachments({
  disabled = false,
  files,
  onAdd,
  onRemove,
}: TaskFormAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length > 0) onAdd(selected);
  }

  return (
    <section className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Attachments</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {files.length} {files.length === 1 ? "file" : "files"}
          </p>
        </div>
        <input
          ref={inputRef}
          accept={acceptedAttachmentTypes}
          className="hidden"
          multiple
          type="file"
          onChange={selectFiles}
        />
        <Button disabled={disabled} variant="secondary" onClick={() => inputRef.current?.click()}>
          <AppIcon name="paperclip" size={16} />
          Add
        </Button>
      </div>
      {files.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          No files selected.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border">
          {files.map((file, index) => (
            <li className="flex items-center justify-between gap-3 px-3 py-2" key={`${file.name}-${index}`}>
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Button
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                title="Remove"
                variant="icon"
                onClick={() => onRemove(index)}
              >
                <AppIcon name="trash" size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
