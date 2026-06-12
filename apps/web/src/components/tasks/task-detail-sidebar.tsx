"use client";

import { TaskAttachments } from "@/components/tasks/task-attachments";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Task, TaskAttachment } from "@/types/task";

type TaskDetailSidebarProps = {
  attachments: TaskAttachment[];
  task: Task;
  onAttachmentsChanged: () => Promise<void> | void;
};

export function TaskDetailSidebar({
  attachments,
  task,
  onAttachmentsChanged,
}: TaskDetailSidebarProps) {
  return (
    <aside className="rounded-lg border border-border bg-surface shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">Details</h2>
      </div>
      <dl className="divide-y divide-border px-4">
        <DetailRow label="Status">
          <StatusBadge kind="status" value={task.status} />
        </DetailRow>
        <DetailRow label="Priority">
          <StatusBadge kind="priority" value={task.priority} />
        </DetailRow>
        <DetailRow label="Owner">
          <span className="break-words font-medium">{task.userEmail || "You"}</span>
        </DetailRow>
        <DetailRow label="Due date">
          <span className="font-medium">{formatDate(task.dueDate)}</span>
        </DetailRow>
        <DetailRow label="Created">
          <span className="font-medium">{formatDateTime(task.createdAt)}</span>
        </DetailRow>
        <DetailRow label="Updated">
          <span className="font-medium">{formatDateTime(task.updatedAt)}</span>
        </DetailRow>
      </dl>
      <div className="border-t border-border p-4">
        <TaskAttachments
          attachments={attachments}
          taskId={task.id}
          variant="embedded"
          onChanged={onAttachmentsChanged}
        />
      </div>
    </aside>
  );
}

function DetailRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-foreground">{children}</dd>
    </div>
  );
}
