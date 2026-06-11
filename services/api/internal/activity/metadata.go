package activity

import (
	"time"

	"vector-task-api/internal/task"
)

func CreatedMetadata(item task.Task) Metadata {
	return Metadata{
		"title": item.Title, "status": item.Status, "priority": item.Priority,
		"dueDate": dateValue(item.DueDate),
	}
}

func UpdatedMetadata(before, after task.Task) Metadata {
	changes := map[string]Change{}
	addChange(changes, "title", before.Title, after.Title)
	addChange(changes, "description", before.Description, after.Description)
	addChange(changes, "status", before.Status, after.Status)
	addChange(changes, "priority", before.Priority, after.Priority)
	addChange(changes, "dueDate", dateValue(before.DueDate), dateValue(after.DueDate))
	return Metadata{"changes": changes}
}

func HasChanges(metadata Metadata) bool {
	changes, ok := metadata["changes"].(map[string]Change)
	return ok && len(changes) > 0
}

func UpdateAction(metadata Metadata) string {
	changes, ok := metadata["changes"].(map[string]Change)
	if !ok {
		return TaskUpdated
	}
	if status, ok := changes["status"]; ok && status.To == "completed" {
		return TaskCompleted
	}
	return TaskUpdated
}

func addChange(changes map[string]Change, field string, from, to any) {
	if from != to {
		changes[field] = Change{From: from, To: to}
	}
}

func dateValue(value *time.Time) any {
	if value == nil {
		return nil
	}
	return value.UTC().Format(time.RFC3339)
}
