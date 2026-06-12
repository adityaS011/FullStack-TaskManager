package attachment

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, input CreateInput) (Attachment, error) {
	return scanAttachment(r.pool.QueryRow(ctx, `
		INSERT INTO task_attachments (task_id, uploaded_by, file_name, content_type, size_bytes, storage_key)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, task_id, uploaded_by, ''::text, file_name, content_type, size_bytes, storage_key, created_at
	`, input.TaskID, input.UploaderID, input.FileName, input.ContentType, input.SizeBytes, input.StorageKey))
}

func (r *Repository) Delete(ctx context.Context, id, taskID string) (Attachment, error) {
	return scanAttachment(r.pool.QueryRow(ctx, `
		DELETE FROM task_attachments
		WHERE id = $1 AND task_id = $2
		RETURNING id, task_id, uploaded_by, ''::text, file_name, content_type, size_bytes, storage_key, created_at
	`, id, taskID))
}

func (r *Repository) GetForTask(ctx context.Context, id, taskID string) (Attachment, error) {
	return scanAttachment(r.pool.QueryRow(ctx, attachmentSelect()+`
		WHERE a.id = $1 AND a.task_id = $2
	`, id, taskID))
}

func (r *Repository) ListForTask(ctx context.Context, taskID string) ([]Attachment, error) {
	rows, err := r.pool.Query(ctx, attachmentSelect()+`
		WHERE a.task_id = $1
		ORDER BY a.created_at DESC
	`, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []Attachment{}
	for rows.Next() {
		item, err := scanAttachment(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanAttachment(row rowScanner) (Attachment, error) {
	var item Attachment
	err := row.Scan(
		&item.ID, &item.TaskID, &item.UploadedBy, &item.UploaderEmail,
		&item.FileName, &item.ContentType, &item.SizeBytes, &item.StorageKey, &item.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Attachment{}, ErrAttachmentNotFound
	}
	return item, err
}

func attachmentSelect() string {
	return `
		SELECT a.id, a.task_id, a.uploaded_by, u.email, a.file_name, a.content_type,
			a.size_bytes, a.storage_key, a.created_at
		FROM task_attachments a
		JOIN users u ON u.id = a.uploaded_by
	`
}
