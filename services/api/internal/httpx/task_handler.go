package httpx

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"vector-task-api/internal/realtime"
	"vector-task-api/internal/task"
	"vector-task-api/internal/validation"

	"github.com/go-chi/chi/v5"
)

type taskEndpoints struct {
	events  *realtime.Hub
	service *task.Service
}

type taskRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	Priority    *string `json:"priority"`
	DueDate     *string `json:"dueDate"`
}

func (h taskEndpoints) create(w http.ResponseWriter, r *http.Request) {
	input, ok := decodeTaskRequest(w, r)
	if !ok {
		return
	}
	dueDate, fields := parseDate(input.DueDate)
	if fields.HasAny() {
		writeError(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields)
		return
	}
	created, fields, err := h.service.Create(r.Context(), currentUser(r).ID, task.CreateInput{
		Title: deref(input.Title), Description: deref(input.Description),
		Status: deref(input.Status), Priority: deref(input.Priority), DueDate: dueDate,
	})
	if err != nil {
		writeValidationOrService(w, fields, err)
		return
	}
	h.publish(realtime.TaskCreated, currentUser(r).ID, created)
	writeJSON(w, http.StatusCreated, created)
}

func (h taskEndpoints) delete(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	deleted, err := h.service.Delete(r.Context(), chi.URLParam(r, "id"), user.ID, user.Role == "admin")
	if err != nil {
		writeServiceError(w, err)
		return
	}
	h.publish(realtime.TaskDeleted, user.ID, deleted)
	w.WriteHeader(http.StatusNoContent)
}

func (h taskEndpoints) get(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	item, err := h.service.Get(r.Context(), chi.URLParam(r, "id"), user.ID, user.Role == "admin")
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h taskEndpoints) list(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	result, err := h.service.List(r.Context(), listFilter(r, user.ID, false))
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h taskEndpoints) adminList(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	result, err := h.service.List(r.Context(), listFilter(r, user.ID, true))
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h taskEndpoints) update(w http.ResponseWriter, r *http.Request) {
	input, ok := decodeTaskRequest(w, r)
	if !ok {
		return
	}
	dueDate, fields := parseDate(input.DueDate)
	if fields.HasAny() {
		writeError(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields)
		return
	}
	user := currentUser(r)
	updated, fields, err := h.service.Update(r.Context(), chi.URLParam(r, "id"), user.ID, user.Role == "admin", task.UpdateInput{
		Title: input.Title, Description: input.Description, Status: input.Status,
		Priority: input.Priority, DueDate: dueDate,
	})
	if err != nil {
		writeValidationOrService(w, fields, err)
		return
	}
	h.publish(realtime.TaskUpdated, user.ID, updated)
	writeJSON(w, http.StatusOK, updated)
}

func (h taskEndpoints) publish(eventType, actorID string, item task.Task) {
	if h.events == nil {
		return
	}
	h.events.Publish(realtime.Event{
		Type: eventType, TaskID: item.ID, UserID: item.UserID, ActorID: actorID,
	})
}

func decodeTaskRequest(w http.ResponseWriter, r *http.Request) (taskRequest, bool) {
	var input taskRequest
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "Request body is invalid.", nil)
		return input, false
	}
	return input, true
}

func listFilter(r *http.Request, userID string, admin bool) task.ListFilter {
	query := r.URL.Query()
	return task.ListFilter{
		UserID: userID, IsAdmin: admin, Status: query.Get("status"), Query: query.Get("q"),
		Sort: query.Get("sort"), Direction: query.Get("direction"),
		Page: intQuery(query.Get("page"), 1), PageSize: intQuery(query.Get("pageSize"), 10),
	}
}

func writeValidationOrService(w http.ResponseWriter, fields map[string]string, err error) {
	if errors.Is(err, task.ErrValidation) || len(fields) > 0 {
		writeError(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields)
		return
	}
	writeServiceError(w, err)
}

func parseDate(value *string) (*time.Time, validation.FieldErrors) {
	fields := validation.FieldErrors{}
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil, fields
	}
	// Accept both browser date-input values and full RFC3339 timestamps from API clients.
	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*value))
	if err != nil {
		parsed, err = time.Parse("2006-01-02", strings.TrimSpace(*value))
	}
	if err != nil {
		fields.Add("dueDate", "Use a valid due date.")
		return nil, fields
	}
	return &parsed, fields
}

func deref(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func intQuery(value string, fallback int) int {
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
