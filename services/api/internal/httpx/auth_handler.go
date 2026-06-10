package httpx

import (
	"errors"
	"net/http"

	"vector-task-api/internal/auth"
)

type authEndpoints struct {
	service *auth.Service
}

func (h authEndpoints) signUp(w http.ResponseWriter, r *http.Request) {
	var input auth.SignUpInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "Request body is invalid.", nil)
		return
	}
	result, fields, err := h.service.SignUp(r.Context(), input)
	if err != nil {
		if errors.Is(err, auth.ErrValidation) {
			writeError(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields)
			return
		}
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (h authEndpoints) login(w http.ResponseWriter, r *http.Request) {
	var input auth.LoginInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "Request body is invalid.", nil)
		return
	}
	result, fields, err := h.service.Login(r.Context(), input)
	if err != nil {
		if errors.Is(err, auth.ErrValidation) {
			writeError(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields)
			return
		}
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h authEndpoints) me(w http.ResponseWriter, r *http.Request) {
	user, err := h.service.Me(r.Context(), currentUser(r).ID)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, user)
}
