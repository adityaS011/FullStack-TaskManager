package activity

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, input CreateInput) error {
	metadata, err := json.Marshal(input.Metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
		INSERT INTO activity_logs (task_id, user_id, action, metadata)
		VALUES ($1, $2, $3, $4)
	`, input.TaskID, input.ActorID, input.Action, metadata)
	return err
}

func (r *Repository) ListForTask(ctx context.Context, taskID string) ([]Log, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT a.id, a.task_id, a.user_id, u.email, a.action, a.metadata, a.created_at
		FROM activity_logs a
		JOIN users u ON u.id = a.user_id
		WHERE a.task_id = $1
		ORDER BY a.created_at DESC
	`, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := []Log{}
	for rows.Next() {
		var log Log
		var metadata []byte
		err := rows.Scan(
			&log.ID, &log.TaskID, &log.ActorID, &log.ActorEmail,
			&log.Action, &metadata, &log.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(metadata, &log.Metadata); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}
