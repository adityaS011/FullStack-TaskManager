package task

import (
	"context"
	"testing"
)

type fakeTaskStore struct {
	filter ListFilter
}

func (f *fakeTaskStore) Create(ctx context.Context, userID string, input CreateInput) (Task, error) {
	return Task{}, nil
}

func (f *fakeTaskStore) Delete(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	return Task{}, nil
}

func (f *fakeTaskStore) Get(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	return Task{}, nil
}

func (f *fakeTaskStore) List(ctx context.Context, filter ListFilter) (ListResult, error) {
	f.filter = filter
	return ListResult{Items: []Task{}, Total: 21, Page: filter.Page, PageSize: filter.PageSize}, nil
}

func (f *fakeTaskStore) Update(ctx context.Context, id, userID string, isAdmin bool, input UpdateInput) (Task, error) {
	return Task{}, nil
}

func TestListNormalizesUnsafeFilters(t *testing.T) {
	store := &fakeTaskStore{}
	service := NewService(store)

	result, err := service.List(context.Background(), ListFilter{
		UserID: "user-1", Page: -2, PageSize: 999, Status: "archived",
		Sort: "title", Direction: "sideways",
	})
	if err != nil {
		t.Fatalf("expected list to succeed, got %v", err)
	}
	if store.filter.Page != 1 || store.filter.PageSize != 10 {
		t.Fatalf("expected pagination defaults, got page=%d size=%d", store.filter.Page, store.filter.PageSize)
	}
	if store.filter.Status != "" || store.filter.Sort != "created_at" || store.filter.Direction != "desc" {
		t.Fatalf("expected safe filters, got %+v", store.filter)
	}
	if result.TotalPages != 3 {
		t.Fatalf("expected total pages to be 3, got %d", result.TotalPages)
	}
}

func TestUpdateRequiresAtLeastOneChange(t *testing.T) {
	service := NewService(&fakeTaskStore{})
	_, _, err := service.Update(context.Background(), "task-1", "user-1", false, UpdateInput{})
	if err != ErrNoChanges {
		t.Fatalf("expected ErrNoChanges, got %v", err)
	}
}
