package task

import (
	"strings"

	"vector-task-api/internal/validation"
)

func validateCreate(input CreateInput) validation.FieldErrors {
	fields := validation.FieldErrors{}
	if len(strings.TrimSpace(input.Title)) < 3 {
		fields.Add("title", "Title must be at least 3 characters.")
	}
	if len(input.Description) > 1000 {
		fields.Add("description", "Description must be 1000 characters or less.")
	}
	if input.Status == "" {
		input.Status = "todo"
	}
	if !validation.Status(input.Status) {
		fields.Add("status", "Choose a valid status.")
	}
	if input.Priority == "" {
		input.Priority = "medium"
	}
	if !validation.Priority(input.Priority) {
		fields.Add("priority", "Choose a valid priority.")
	}
	return fields
}

func validateUpdate(input UpdateInput) validation.FieldErrors {
	fields := validation.FieldErrors{}
	if input.Title != nil && len(strings.TrimSpace(*input.Title)) < 3 {
		fields.Add("title", "Title must be at least 3 characters.")
	}
	if input.Description != nil && len(*input.Description) > 1000 {
		fields.Add("description", "Description must be 1000 characters or less.")
	}
	if input.Status != nil && !validation.Status(*input.Status) {
		fields.Add("status", "Choose a valid status.")
	}
	if input.Priority != nil && !validation.Priority(*input.Priority) {
		fields.Add("priority", "Choose a valid priority.")
	}
	return fields
}

func normalizeCreate(input CreateInput) CreateInput {
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	if input.Status == "" {
		input.Status = "todo"
	}
	if input.Priority == "" {
		input.Priority = "medium"
	}
	return input
}

func normalizeUpdate(input UpdateInput) UpdateInput {
	if input.Title != nil {
		value := strings.TrimSpace(*input.Title)
		input.Title = &value
	}
	if input.Description != nil {
		value := strings.TrimSpace(*input.Description)
		input.Description = &value
	}
	return input
}

func isEmptyUpdate(input UpdateInput) bool {
	return input.Title == nil &&
		input.Description == nil &&
		input.Status == nil &&
		input.Priority == nil &&
		input.DueDate == nil
}
