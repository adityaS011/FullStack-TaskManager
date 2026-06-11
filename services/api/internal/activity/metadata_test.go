package activity

import (
	"testing"
	"time"

	"vector-task-api/internal/task"
)

func TestUpdatedMetadataOnlyIncludesChangedFields(t *testing.T) {
	due := time.Date(2026, 6, 20, 12, 0, 0, 0, time.UTC)
	before := task.Task{Title: "A", Status: "todo", Priority: "medium", DueDate: &due}
	after := task.Task{Title: "A", Status: "completed", Priority: "high", DueDate: &due}

	metadata := UpdatedMetadata(before, after)
	changes := metadata["changes"].(map[string]Change)

	if len(changes) != 2 {
		t.Fatalf("expected 2 changes, got %d: %#v", len(changes), changes)
	}
	if changes["status"].To != "completed" || changes["priority"].From != "medium" {
		t.Fatalf("unexpected changes: %#v", changes)
	}
	if UpdateAction(metadata) != TaskCompleted {
		t.Fatalf("expected completed action, got %s", UpdateAction(metadata))
	}
}

func TestUpdatedMetadataDetectsNoChanges(t *testing.T) {
	item := task.Task{Title: "A", Status: "todo", Priority: "medium"}

	metadata := UpdatedMetadata(item, item)
	if HasChanges(metadata) {
		t.Fatalf("expected no changes, got %#v", metadata)
	}
}
