package activity

import "context"

type Store interface {
	Create(ctx context.Context, input CreateInput) error
	ListForTask(ctx context.Context, taskID string) ([]Log, error)
}

type Service struct {
	store Store
}

func NewService(store Store) *Service {
	return &Service{store: store}
}

func (s *Service) Record(ctx context.Context, input CreateInput) error {
	if input.TaskID == "" || input.ActorID == "" || input.Action == "" {
		return nil
	}
	if input.Metadata == nil {
		input.Metadata = Metadata{}
	}
	return s.store.Create(ctx, input)
}

func (s *Service) ListForTask(ctx context.Context, taskID string) ([]Log, error) {
	return s.store.ListForTask(ctx, taskID)
}
