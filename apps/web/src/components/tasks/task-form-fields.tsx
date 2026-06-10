"use client";

import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { Select, SelectOption } from "@/components/ui/select";
import { FieldErrors, TaskPriority, TaskStatus } from "@/types/task";

export type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

type TaskFormFieldsProps = {
  payload: TaskFormState;
  errors: FieldErrors;
  onChange: (payload: TaskFormState) => void;
};

const statusOptions: SelectOption[] = [
  { label: "Todo", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const priorityOptions: SelectOption[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export function TaskFormFields({ payload, errors, onChange }: TaskFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={payload.title}
          onChange={(event) => onChange({ ...payload, title: event.target.value })}
        />
        <FieldError message={errors.title} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={payload.description}
          onChange={(event) => onChange({ ...payload, description: event.target.value })}
        />
        <FieldError message={errors.description} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            options={statusOptions}
            value={payload.status}
            onValueChange={(status) => onChange({ ...payload, status: status as TaskStatus })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            options={priorityOptions}
            value={payload.priority}
            onValueChange={(priority) => onChange({ ...payload, priority: priority as TaskPriority })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dueDate">Due date</Label>
        <Input
          id="dueDate"
          type="date"
          value={payload.dueDate}
          onChange={(event) => onChange({ ...payload, dueDate: event.target.value })}
        />
        <FieldError message={errors.dueDate} />
      </div>
    </div>
  );
}
