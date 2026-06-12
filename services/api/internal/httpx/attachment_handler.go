package httpx

import (
	"bytes"
	"errors"
	"io"
	"mime"
	"net/http"
	"strconv"

	"vector-task-api/internal/activity"
	"vector-task-api/internal/attachment"
	"vector-task-api/internal/realtime"
	"vector-task-api/internal/task"

	"github.com/go-chi/chi/v5"
)

const multipartEnvelopeBytes int64 = 1 << 20

type attachmentEndpoints struct {
	activity    *activity.Service
	attachments *attachment.Service
	events      *realtime.Hub
	tasks       *task.Service
}

func (h attachmentEndpoints) upload(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	item, ok := h.authorizedTask(w, r)
	if !ok {
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, attachment.MaxFileSizeBytes+multipartEnvelopeBytes)
	if err := r.ParseMultipartForm(multipartEnvelopeBytes); err != nil {
		var maxBytesError *http.MaxBytesError
		if errors.As(err, &maxBytesError) {
			writeServiceError(w, attachment.ErrFileTooLarge)
			return
		}
		writeError(w, http.StatusBadRequest, "INVALID_MULTIPART", "Upload a valid file.", nil)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeServiceError(w, attachment.ErrFileRequired)
		return
	}
	defer file.Close()

	body, contentType, err := sniffFile(file, header.Header.Get("Content-Type"))
	if err != nil {
		writeServiceError(w, err)
		return
	}
	created, err := h.attachments.Upload(r.Context(), attachment.UploadInput{
		TaskID: item.ID, UploaderID: user.ID, FileName: header.Filename,
		ContentType: contentType, SizeBytes: header.Size, Body: body,
	})
	if err != nil {
		writeServiceError(w, err)
		return
	}
	h.recordActivity(r, item, activity.AttachmentAdded, created)
	h.publish(user.ID, item)
	writeJSON(w, http.StatusCreated, created)
}

func (h attachmentEndpoints) list(w http.ResponseWriter, r *http.Request) {
	item, ok := h.authorizedTask(w, r)
	if !ok {
		return
	}
	attachments, err := h.attachments.ListForTask(r.Context(), item.ID)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, attachments)
}

func (h attachmentEndpoints) download(w http.ResponseWriter, r *http.Request) {
	item, ok := h.authorizedTask(w, r)
	if !ok {
		return
	}
	file, body, err := h.attachments.Download(r.Context(), item.ID, chi.URLParam(r, "attachmentID"))
	if err != nil {
		writeServiceError(w, err)
		return
	}
	defer body.Close()

	w.Header().Set("Content-Type", file.ContentType)
	w.Header().Set("Content-Length", strconv.FormatInt(file.SizeBytes, 10))
	w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": file.FileName}))
	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, body)
}

func (h attachmentEndpoints) delete(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	item, ok := h.authorizedTask(w, r)
	if !ok {
		return
	}
	deleted, err := h.attachments.Delete(r.Context(), item.ID, chi.URLParam(r, "attachmentID"))
	if err != nil {
		writeServiceError(w, err)
		return
	}
	h.recordActivity(r, item, activity.AttachmentDeleted, deleted)
	h.publish(user.ID, item)
	w.WriteHeader(http.StatusNoContent)
}

func (h attachmentEndpoints) authorizedTask(w http.ResponseWriter, r *http.Request) (task.Task, bool) {
	user := currentUser(r)
	item, err := h.tasks.Get(r.Context(), chi.URLParam(r, "id"), user.ID, user.Role == "admin")
	if err != nil {
		writeServiceError(w, err)
		return task.Task{}, false
	}
	return item, true
}

func (h attachmentEndpoints) recordActivity(r *http.Request, item task.Task, action string, file attachment.Attachment) {
	if h.activity == nil {
		return
	}
	_ = h.activity.Record(r.Context(), activity.CreateInput{
		TaskID: item.ID, ActorID: currentUser(r).ID, Action: action,
		Metadata: activity.AttachmentMetadata(file.FileName, file.ContentType, file.SizeBytes),
	})
}

func (h attachmentEndpoints) publish(actorID string, item task.Task) {
	if h.events == nil {
		return
	}
	h.events.Publish(realtime.Event{
		Type: realtime.TaskUpdated, TaskID: item.ID, UserID: item.UserID, ActorID: actorID,
	})
}

func sniffFile(file io.Reader, provided string) (io.Reader, string, error) {
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return nil, "", err
	}
	contentType := provided
	if contentType == "" || contentType == "application/octet-stream" {
		contentType = http.DetectContentType(buffer[:n])
	}
	return io.MultiReader(bytes.NewReader(buffer[:n]), file), contentType, nil
}
