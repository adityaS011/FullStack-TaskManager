package attachment

import (
	"context"
	"io"
)

type Storage interface {
	Save(ctx context.Context, key string, body io.Reader) error
	Open(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
}
