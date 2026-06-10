package task

import "time"

type Task struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	UserEmail   string     `json:"userEmail,omitempty"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"dueDate"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type CreateInput struct {
	Title       string
	Description string
	Status      string
	Priority    string
	DueDate     *time.Time
}

type UpdateInput struct {
	Title       *string
	Description *string
	Status      *string
	Priority    *string
	DueDate     *time.Time
}

type ListFilter struct {
	UserID    string
	IsAdmin   bool
	Status    string
	Query     string
	Sort      string
	Direction string
	Page      int
	PageSize  int
}

type ListResult struct {
	Items      []Task `json:"items"`
	Total      int    `json:"total"`
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	TotalPages int    `json:"totalPages"`
}
