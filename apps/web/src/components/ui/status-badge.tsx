import { cn, titleCase } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/task";

const statusStyles: Record<TaskStatus, string> = {
  todo: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  in_progress: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
  medium: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  high: "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
  urgent: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
};

type BadgeProps =
  | { kind: "status"; value: TaskStatus; className?: string }
  | { kind: "priority"; value: TaskPriority; className?: string };

export function StatusBadge(props: BadgeProps) {
  const style = props.kind === "status" ? statusStyles[props.value] : priorityStyles[props.value];
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", style, props.className)}>
      {titleCase(props.value)}
    </span>
  );
}
