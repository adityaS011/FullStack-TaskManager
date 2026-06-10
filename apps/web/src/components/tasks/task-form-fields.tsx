"use client";

import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
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
            value={payload.status}
            onChange={(event) => onChange({ ...payload, status: event.target.value as TaskStatus })}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            value={payload.priority}
            onChange={(event) => onChange({ ...payload, priority: event.target.value as TaskPriority })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
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
