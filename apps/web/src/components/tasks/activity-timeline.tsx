"use client";

import { formatBytes, formatDate, formatDateTime, titleCase } from "@/lib/utils";
import { ActivityChange, ActivityLog } from "@/types/task";

type ActivityTimelineProps = {
  logs: ActivityLog[];
};

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
        No activity has been recorded for this task yet.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {logs.map((log) => (
        <li className="rounded-lg border border-border bg-background p-4" key={log.id}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold">{activityTitle(log)}</p>
              <p className="text-sm text-muted-foreground">{log.actorEmail}</p>
            </div>
            <time className="text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</time>
          </div>
          <ActivityDetails log={log} />
        </li>
      ))}
    </ol>
  );
}

function ActivityDetails({ log }: { log: ActivityLog }) {
  if (log.action === "task.created") {
    return (
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
        <span className="rounded-full border border-border px-2.5 py-1">
          Status: {titleCase(log.metadata.status ?? "todo")}
        </span>
        <span className="rounded-full border border-border px-2.5 py-1">
          Priority: {titleCase(log.metadata.priority ?? "medium")}
        </span>
        <span className="rounded-full border border-border px-2.5 py-1">
          Due: {formatActivityValue("dueDate", log.metadata.dueDate ?? null)}
        </span>
      </div>
    );
  }

  if (log.action === "attachment.added" || log.action === "attachment.deleted") {
    return (
      <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-muted-foreground">
        {log.metadata.fileName ?? "Attachment"} ({formatBytes(log.metadata.sizeBytes ?? 0)})
      </div>
    );
  }

  const changes = Object.entries(log.metadata.changes ?? {});
  if (changes.length === 0) return null;

  return (
    <dl className="mt-3 grid gap-2 text-sm">
      {changes.map(([field, change]) => (
        <div className="rounded-md bg-surface px-3 py-2" key={field}>
          <dt className="font-medium capitalize">{titleCase(field)}</dt>
          <dd className="mt-1 text-muted-foreground">
            {formatActivityValue(field, change.from)} to {formatActivityValue(field, change.to)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function activityTitle(log: ActivityLog) {
  if (log.action === "attachment.added") return "Added attachment";
  if (log.action === "attachment.deleted") return "Deleted attachment";
  if (log.action === "task.created") return "Created task";
  if (log.action === "task.completed") return "Marked task complete";
  return "Updated task";
}

function formatActivityValue(field: string, value: ActivityChange["to"]) {
  if (!value) return field === "dueDate" ? "No due date" : "empty";
  if (field === "dueDate") return formatDate(value);
  return titleCase(String(value));
}
