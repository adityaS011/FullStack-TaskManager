import { AppShell } from "@/components/layout/app-shell";
import { TaskDashboard } from "@/components/tasks/task-dashboard";

export default function TasksPage() {
  return (
    <AppShell>
      <TaskDashboard />
    </AppShell>
  );
}
