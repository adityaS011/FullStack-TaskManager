package activity

import "time"

const (
	AttachmentAdded   = "attachment.added"
	AttachmentDeleted = "attachment.deleted"
	TaskCompleted     = "task.completed"
	TaskCreated       = "task.created"
	TaskUpdated       = "task.updated"
)

type Metadata map[string]any

type Change struct {
	From any `json:"from"`
	To   any `json:"to"`
}

type Log struct {
	ID         string    `json:"id"`
	TaskID     string    `json:"taskId"`
	ActorID    string    `json:"actorId"`
	ActorEmail string    `json:"actorEmail"`
	Action     string    `json:"action"`
	Metadata   Metadata  `json:"metadata"`
	CreatedAt  time.Time `json:"createdAt"`
}

type CreateInput struct {
	TaskID   string
	ActorID  string
	Action   string
	Metadata Metadata
}
