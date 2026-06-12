package attachment

import (
	"context"
	"errors"
	"io"
	"strings"
	"testing"
	"time"
)

type fakeAttachmentStore struct {
	created CreateInput
}

func (f *fakeAttachmentStore) Create(ctx context.Context, input CreateInput) (Attachment, error) {
	f.created = input
	return Attachment{
		ID: "attachment-1", TaskID: input.TaskID, UploadedBy: input.UploaderID,
		FileName: input.FileName, ContentType: input.ContentType, SizeBytes: input.SizeBytes,
		StorageKey: input.StorageKey, CreatedAt: time.Now(),
	}, nil
}

func (f *fakeAttachmentStore) Delete(ctx context.Context, id, taskID string) (Attachment, error) {
	return Attachment{}, nil
}

func (f *fakeAttachmentStore) GetForTask(ctx context.Context, id, taskID string) (Attachment, error) {
	return Attachment{}, nil
}

func (f *fakeAttachmentStore) ListForTask(ctx context.Context, taskID string) ([]Attachment, error) {
	return nil, nil
}

type fakeStorage struct {
	key  string
	body string
}

func (f *fakeStorage) Save(ctx context.Context, key string, body io.Reader) error {
	bytes, err := io.ReadAll(body)
	if err != nil {
		return err
	}
	f.key = key
	f.body = string(bytes)
	return nil
}

func (f *fakeStorage) Open(ctx context.Context, key string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.body)), nil
}

func (f *fakeStorage) Delete(ctx context.Context, key string) error {
	return nil
}

func TestUploadStoresFileAndMetadata(t *testing.T) {
	store := &fakeAttachmentStore{}
	storage := &fakeStorage{}
	service := NewService(store, storage)

	item, err := service.Upload(context.Background(), UploadInput{
		TaskID: "task-1", UploaderID: "user-1", FileName: "../notes.txt",
		ContentType: "text/plain; charset=utf-8", SizeBytes: 5, Body: strings.NewReader("hello"),
	})
	if err != nil {
		t.Fatalf("expected upload to succeed, got %v", err)
	}
	if item.FileName != "notes.txt" || item.ContentType != "text/plain" {
		t.Fatalf("expected cleaned metadata, got %+v", item)
	}
	if storage.body != "hello" || !strings.HasPrefix(storage.key, "task-1/") {
		t.Fatalf("expected file saved with task-scoped key, got key=%q body=%q", storage.key, storage.body)
	}
	if store.created.StorageKey != storage.key {
		t.Fatalf("expected metadata to reference saved key")
	}
}

func TestUploadRejectsUnsupportedContentType(t *testing.T) {
	service := NewService(&fakeAttachmentStore{}, &fakeStorage{})

	_, err := service.Upload(context.Background(), UploadInput{
		TaskID: "task-1", UploaderID: "user-1", FileName: "script.html",
		ContentType: "text/html", SizeBytes: 12, Body: strings.NewReader("<script />"),
	})
	if !errors.Is(err, ErrUnsupportedContentType) {
		t.Fatalf("expected unsupported content type, got %v", err)
	}
}
