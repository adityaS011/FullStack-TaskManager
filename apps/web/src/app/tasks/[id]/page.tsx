import { AppShell } from "@/components/layout/app-shell";
import { TaskDetailPage } from "@/components/tasks/task-detail-page";

type TaskRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskPage({ params }: TaskRouteProps) {
  const { id } = await params;

  return (
    <AppShell>
      <TaskDetailPage taskId={id} />
    </AppShell>
  );
}
