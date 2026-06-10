"use client";

import { Pagination } from "@/components/tasks/pagination";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { TaskOverview } from "@/components/tasks/task-overview";
import { useTaskDashboard } from "@/components/tasks/use-task-dashboard";
import { Drawer } from "@/components/ui/drawer";

export function TaskDashboard() {
  const dashboard = useTaskDashboard();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <TaskOverview data={dashboard.data} filters={dashboard.filters} />
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
            onComplete={dashboard.completeTask}
            onDelete={dashboard.deleteTask}
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
    </div>
  );
}
