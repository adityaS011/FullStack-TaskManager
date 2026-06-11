package httpx

import (
	"net/http"

	"vector-task-api/internal/auth"
	"vector-task-api/internal/realtime"
)

type realtimeEndpoints struct {
	auth   *auth.Service
	hub    *realtime.Hub
	origin string
}

func (h realtimeEndpoints) tasks(w http.ResponseWriter, r *http.Request) {
	if h.hub == nil {
		writeError(w, http.StatusServiceUnavailable, "REALTIME_DISABLED", "Realtime updates are unavailable.", nil)
		return
	}

	user, err := h.auth.VerifyToken(r.URL.Query().Get("token"))
	if err != nil || user.ID == "" {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.", nil)
		return
	}

	err = h.hub.ServeWS(w, r, realtime.ClientIdentity{Role: user.Role, UserID: user.ID}, h.origin)
	if err != nil {
		writeError(w, http.StatusBadRequest, "WEBSOCKET_UPGRADE_FAILED", "Could not open realtime connection.", nil)
	}
}
