import { fireEvent, render, screen } from "@testing-library/react";

import { TaskScopeToggle } from "@/components/tasks/task-scope-toggle";

describe("TaskScopeToggle", () => {
  it("is hidden for members", () => {
    const onScopeChange = jest.fn();

    render(
      <TaskScopeToggle
        canViewAllTasks={false}
        scope="mine"
        onScopeChange={onScopeChange}
      />,
    );

    expect(screen.queryByLabelText("Task visibility")).not.toBeInTheDocument();
  });

  it("lets admins switch to all users", () => {
    const onScopeChange = jest.fn();

    render(
      <TaskScopeToggle
        canViewAllTasks
        scope="mine"
        onScopeChange={onScopeChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "All users" }));
    expect(onScopeChange).toHaveBeenCalledWith("all");
  });
});
