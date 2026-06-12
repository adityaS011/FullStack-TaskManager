package attachment

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"io"
	"path"
	"strings"
)

type Store interface {
	Create(ctx context.Context, input CreateInput) (Attachment, error)
	Delete(ctx context.Context, id, taskID string) (Attachment, error)
	GetForTask(ctx context.Context, id, taskID string) (Attachment, error)
	ListForTask(ctx context.Context, taskID string) ([]Attachment, error)
}

type Service struct {
	store   Store
	storage Storage
}

func NewService(store Store, storage Storage) *Service {
	return &Service{store: store, storage: storage}
}

func (s *Service) Upload(ctx context.Context, input UploadInput) (Attachment, error) {
	normalized, err := normalizeUpload(input)
	if err != nil {
		return Attachment{}, err
	}
	key, err := storageKey(normalized.TaskID)
	if err != nil {
		return Attachment{}, err
	}
	if err := s.storage.Save(ctx, key, io.LimitReader(normalized.Body, normalized.SizeBytes)); err != nil {
		return Attachment{}, err
	}

	created, err := s.store.Create(ctx, CreateInput{
		TaskID: normalized.TaskID, UploaderID: normalized.UploaderID, FileName: normalized.FileName,
		ContentType: normalized.ContentType, SizeBytes: normalized.SizeBytes, StorageKey: key,
	})
	if err != nil {
		_ = s.storage.Delete(ctx, key)
		return Attachment{}, err
	}
	return created, nil
}

func (s *Service) Delete(ctx context.Context, taskID, attachmentID string) (Attachment, error) {
	deleted, err := s.store.Delete(ctx, attachmentID, taskID)
	if err != nil {
		return Attachment{}, err
	}
	if err := s.storage.Delete(ctx, deleted.StorageKey); err != nil {
		return deleted, err
	}
	return deleted, nil
}

func (s *Service) Download(ctx context.Context, taskID, attachmentID string) (Attachment, io.ReadCloser, error) {
	item, err := s.store.GetForTask(ctx, attachmentID, taskID)
	if err != nil {
		return Attachment{}, nil, err
	}
	body, err := s.storage.Open(ctx, item.StorageKey)
	if err != nil {
		return Attachment{}, nil, err
	}
	return item, body, nil
}

func (s *Service) ListForTask(ctx context.Context, taskID string) ([]Attachment, error) {
	return s.store.ListForTask(ctx, taskID)
}

func normalizeUpload(input UploadInput) (UploadInput, error) {
	input.FileName = cleanFileName(input.FileName)
	input.ContentType = cleanContentType(input.ContentType)
	if input.Body == nil || input.SizeBytes <= 0 {
		return input, ErrFileRequired
	}
	if input.SizeBytes > MaxFileSizeBytes {
		return input, ErrFileTooLarge
	}
	if !allowedContentType(input.ContentType) {
		return input, ErrUnsupportedContentType
	}
	if input.FileName == "" {
		input.FileName = "attachment"
	}
	return input, nil
}

func cleanFileName(value string) string {
	value = strings.ReplaceAll(value, "\\", "/")
	value = path.Base(strings.TrimSpace(value))
	value = strings.Map(func(r rune) rune {
		if r < 32 || r == 127 {
			return -1
		}
		return r
	}, value)
	runes := []rune(value)
	if len(runes) > 180 {
		return string(runes[:180])
	}
	return value
}

func cleanContentType(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if mediaType, _, ok := strings.Cut(value, ";"); ok {
		value = strings.TrimSpace(mediaType)
	}
	return value
}

func allowedContentType(value string) bool {
	switch value {
	case "image/gif", "image/jpeg", "image/png", "image/webp",
		"application/msword", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain":
		return true
	default:
		return false
	}
}

func storageKey(taskID string) (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return path.Join(taskID, hex.EncodeToString(bytes)), nil
}
