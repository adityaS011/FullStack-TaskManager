"use client";

import { useState } from "react";

import { Pagination } from "@/components/tasks/pagination";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { TaskOverview } from "@/components/tasks/task-overview";
import { TaskScopeToggle } from "@/components/tasks/task-scope-toggle";
import { useTaskDashboard } from "@/components/tasks/use-task-dashboard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer } from "@/components/ui/drawer";
import { Task } from "@/types/task";

type PendingAction = { task: Task; type: "complete" | "delete" } | null;

export function TaskDashboard() {
  const dashboard = useTaskDashboard();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [confirming, setConfirming] = useState(false);

  const confirmation = getConfirmationCopy(pendingAction);

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setConfirming(true);
    try {
      if (pendingAction.type === "complete") {
        await dashboard.completeTask(pendingAction.task);
      } else {
        await dashboard.deleteTask(pendingAction.task);
      }
      setPendingAction(null);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <TaskOverview data={dashboard.data} filters={dashboard.filters} />
      <TaskScopeToggle
        canViewAllTasks={dashboard.canViewAllTasks}
        scope={dashboard.scope}
        onScopeChange={dashboard.updateScope}
      />
      <TaskFilters
        filters={dashboard.filters}
        onChange={dashboard.updateFilters}
        onCreate={() => dashboard.openForm()}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <TaskList
            error={dashboard.error}
            loading={dashboard.loading}
            tasks={dashboard.data.items}
            onComplete={(task) => setPendingAction({ task, type: "complete" })}
            onDelete={(task) => setPendingAction({ task, type: "delete" })}
            onEdit={dashboard.openForm}
          />
          <Pagination
            page={dashboard.data.page}
            total={dashboard.data.total}
            totalPages={dashboard.data.totalPages}
            onPageChange={dashboard.setPage}
          />
        </section>
      </div>
      <Drawer
        open={dashboard.showForm}
        title={dashboard.editing ? "Edit task" : "Create task"}
        onClose={dashboard.closeForm}
      >
        <TaskForm
          key={dashboard.editing?.id ?? "new"}
          className="min-h-full rounded-none border-0 shadow-none"
          task={dashboard.editing}
          saving={dashboard.saving}
          serverErrors={dashboard.serverErrors}
          onCancel={dashboard.closeForm}
          onSubmit={dashboard.saveTask}
        />
      </Drawer>
      <ConfirmDialog
        busy={confirming}
        confirmLabel={confirmation.confirmLabel}
        description={confirmation.description}
        open={pendingAction !== null}
        title={confirmation.title}
        variant={confirmation.variant}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </div>
  );
}

function getConfirmationCopy(action: PendingAction) {
  if (action?.type === "delete") {
    return {
      confirmLabel: "Delete task",
      description: `This will permanently delete "${action.task.title}". This action cannot be undone.`,
      title: "Delete this task?",
      variant: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark complete",
    description: action
      ? `This will move "${action.task.title}" to completed status.`
      : "Confirm this task action.",
    title: "Mark task as complete?",
    variant: "primary" as const,
  };
}
