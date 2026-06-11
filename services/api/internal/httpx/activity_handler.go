package httpx

import (
	"net/http"

	"vector-task-api/internal/activity"
	"vector-task-api/internal/task"

	"github.com/go-chi/chi/v5"
)

type activityEndpoints struct {
	activity *activity.Service
	tasks    *task.Service
}

func (h activityEndpoints) list(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	taskID := chi.URLParam(r, "id")

	_, err := h.tasks.Get(r.Context(), taskID, user.ID, user.Role == "admin")
	if err != nil {
		writeServiceError(w, err)
		return
	}

	logs, err := h.activity.ListForTask(r.Context(), taskID)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, logs)
}
