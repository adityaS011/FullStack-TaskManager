package realtime

const (
	TaskCreated = "task.created"
	TaskUpdated = "task.updated"
	TaskDeleted = "task.deleted"
)

type Event struct {
	Type    string `json:"type"`
	TaskID  string `json:"taskId"`
	UserID  string `json:"userId"`
	ActorID string `json:"actorId"`
}

func (e Event) VisibleTo(userID, role string) bool {
	return role == "admin" || e.UserID == userID
}
