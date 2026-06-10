import { cn, titleCase } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/task";

const statusStyles: Record<TaskStatus, string> = {
  todo: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  in_progress: "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "border-lime-300 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950 dark:text-lime-200",
  medium: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  high: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
  urgent: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
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
