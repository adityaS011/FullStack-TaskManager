package validation

import (
	"regexp"
	"strings"
	"time"
)

var emailPattern = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

type FieldErrors map[string]string

func (f FieldErrors) Add(field, message string) {
	if strings.TrimSpace(message) != "" {
		f[field] = message
	}
}

func (f FieldErrors) HasAny() bool {
	return len(f) > 0
}

func Email(email string) bool {
	return emailPattern.MatchString(strings.TrimSpace(email))
}

func Password(password string) bool {
	return len(password) >= 8
}

func Status(status string) bool {
	switch status {
	case "todo", "in_progress", "completed":
		return true
	default:
		return false
	}
}

func Priority(priority string) bool {
	switch priority {
	case "low", "medium", "high", "urgent":
		return true
	default:
		return false
	}
}

func NotPastDate(value time.Time) bool {
	today := time.Now().Truncate(24 * time.Hour)
	return !value.Before(today)
}
