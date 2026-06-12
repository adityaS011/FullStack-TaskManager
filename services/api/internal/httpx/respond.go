package httpx

import (
	"encoding/json"
	"errors"
	"net/http"

	"vector-task-api/internal/attachment"
	"vector-task-api/internal/auth"
	"vector-task-api/internal/task"
	"vector-task-api/internal/validation"
)

type errorBody struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Fields  validation.FieldErrors `json:"fields,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, code, message string, fields validation.FieldErrors) {
	writeJSON(w, status, errorBody{Error: apiError{Code: code, Message: message, Fields: fields}})
}

func writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, auth.ErrUserExists):
		writeError(w, http.StatusConflict, "EMAIL_EXISTS", "An account already exists for this email.", nil)
	case errors.Is(err, auth.ErrInvalidCredentials):
		writeError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect.", nil)
	case errors.Is(err, attachment.ErrAttachmentNotFound):
		writeError(w, http.StatusNotFound, "ATTACHMENT_NOT_FOUND", "Attachment was not found.", nil)
	case errors.Is(err, attachment.ErrFileRequired):
		writeError(w, http.StatusUnprocessableEntity, "FILE_REQUIRED", "Choose a file to upload.", nil)
	case errors.Is(err, attachment.ErrFileTooLarge):
		writeError(w, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", "Attachments must be 10 MB or smaller.", nil)
	case errors.Is(err, attachment.ErrUnsupportedContentType):
		writeError(w, http.StatusUnprocessableEntity, "UNSUPPORTED_FILE_TYPE", "Upload an image, PDF, text file, or Word document.", nil)
	case errors.Is(err, task.ErrTaskNotFound):
		writeError(w, http.StatusNotFound, "TASK_NOT_FOUND", "Task was not found.", nil)
	case errors.Is(err, task.ErrNoChanges):
		writeError(w, http.StatusBadRequest, "NO_CHANGES", "Provide at least one field to update.", nil)
	default:
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Something went wrong.", nil)
	}
}

func decodeJSON(r *http.Request, destination any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(destination)
}
