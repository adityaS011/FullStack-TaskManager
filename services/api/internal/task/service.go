package task

import (
	"context"
	"errors"
	"math"
	"strings"

	"vector-task-api/internal/validation"
)

var (
	ErrTaskNotFound = errors.New("task not found")
	ErrNoChanges    = errors.New("no changes provided")
	ErrValidation   = errors.New("validation failed")
)

type Store interface {
	Create(ctx context.Context, userID string, input CreateInput) (Task, error)
	Delete(ctx context.Context, id, userID string, isAdmin bool) (Task, error)
	Get(ctx context.Context, id, userID string, isAdmin bool) (Task, error)
	List(ctx context.Context, filter ListFilter) (ListResult, error)
	Update(ctx context.Context, id, userID string, isAdmin bool, input UpdateInput) (Task, error)
}

type Service struct {
	store Store
}

func NewService(store Store) *Service {
	return &Service{store: store}
}

func (s *Service) Create(ctx context.Context, userID string, input CreateInput) (Task, validation.FieldErrors, error) {
	fields := validateCreate(input)
	if fields.HasAny() {
		return Task{}, fields, validationError()
	}
	item, err := s.store.Create(ctx, userID, normalizeCreate(input))
	return item, nil, err
}

func (s *Service) Delete(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	return s.store.Delete(ctx, id, userID, isAdmin)
}

func (s *Service) Get(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	return s.store.Get(ctx, id, userID, isAdmin)
}

func (s *Service) List(ctx context.Context, filter ListFilter) (ListResult, error) {
	// Normalize query parameters at the service boundary so repository SQL stays predictable.
	normalized := normalizeFilter(filter)
	result, err := s.store.List(ctx, normalized)
	if err != nil {
		return result, err
	}
	result.TotalPages = int(math.Ceil(float64(result.Total) / float64(result.PageSize)))
	return result, nil
}

func (s *Service) Update(ctx context.Context, id, userID string, isAdmin bool, input UpdateInput) (Task, validation.FieldErrors, error) {
	fields := validateUpdate(input)
	if fields.HasAny() {
		return Task{}, fields, validationError()
	}
	if isEmptyUpdate(input) {
		return Task{}, nil, ErrNoChanges
	}
	item, err := s.store.Update(ctx, id, userID, isAdmin, normalizeUpdate(input))
	return item, nil, err
}

func normalizeFilter(filter ListFilter) ListFilter {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 || filter.PageSize > 50 {
		filter.PageSize = 10
	}
	filter.Status = strings.TrimSpace(filter.Status)
	if filter.Status != "" && !validation.Status(filter.Status) {
		filter.Status = ""
	}
	filter.Query = strings.TrimSpace(filter.Query)
	filter.Sort = safeSort(filter.Sort)
	filter.Direction = safeDirection(filter.Direction)
	return filter
}

func safeSort(value string) string {
	switch value {
	case "due_date", "priority", "created_at":
		return value
	default:
		return "created_at"
	}
}

func safeDirection(value string) string {
	if strings.EqualFold(value, "asc") {
		return "asc"
	}
	return "desc"
}

func validationError() error {
	return ErrValidation
}
