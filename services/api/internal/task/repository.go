package task

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, userID string, input CreateInput) (Task, error) {
	return scanTask(r.pool.QueryRow(ctx, `
		INSERT INTO tasks (user_id, title, description, status, priority, due_date)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, ''::text, title, description, status, priority, due_date, created_at, updated_at
	`, userID, input.Title, input.Description, input.Status, input.Priority, input.DueDate))
}

func (r *Repository) Delete(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	sqlText, args := `DELETE FROM tasks WHERE id = $1`, []any{id}
	if !isAdmin {
		sqlText += " AND user_id = $2"
		args = append(args, userID)
	}
	sqlText += `
		RETURNING id, user_id, ''::text, title, description, status, priority, due_date, created_at, updated_at
	`
	return scanTask(r.pool.QueryRow(ctx, sqlText, args...))
}

func (r *Repository) Get(ctx context.Context, id, userID string, isAdmin bool) (Task, error) {
	sqlText, args := ownedQuery(`
		SELECT t.id, t.user_id, u.email, t.title, t.description, t.status, t.priority, t.due_date, t.created_at, t.updated_at
		FROM tasks t
		JOIN users u ON u.id = t.user_id
		WHERE t.id = $1`, id, userID, isAdmin)
	return scanTask(r.pool.QueryRow(ctx, sqlText, args...))
}

func (r *Repository) List(ctx context.Context, filter ListFilter) (ListResult, error) {
	where, args := buildWhere(filter)
	countSQL := `SELECT count(*) FROM tasks t JOIN users u ON u.id = t.user_id ` + where
	var total int
	if err := r.pool.QueryRow(ctx, countSQL, args...).Scan(&total); err != nil {
		return ListResult{}, err
	}

	orderBy := buildOrder(filter.Sort, filter.Direction)
	args = append(args, filter.PageSize, (filter.Page-1)*filter.PageSize)
	query := fmt.Sprintf(`
		SELECT t.id, t.user_id, u.email, t.title, t.description, t.status, t.priority, t.due_date, t.created_at, t.updated_at
		FROM tasks t
		JOIN users u ON u.id = t.user_id
		%s
		ORDER BY %s
		LIMIT $%d OFFSET $%d`, where, orderBy, len(args)-1, len(args))

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return ListResult{}, err
	}
	defer rows.Close()

	items := []Task{}
	for rows.Next() {
		item, err := scanTask(rows)
		if err != nil {
			return ListResult{}, err
		}
		items = append(items, item)
	}
	return ListResult{Items: items, Total: total, Page: filter.Page, PageSize: filter.PageSize}, rows.Err()
}

func (r *Repository) Update(ctx context.Context, id, userID string, isAdmin bool, input UpdateInput) (Task, error) {
	setters, args := []string{}, []any{}
	add := func(column string, value any) {
		args = append(args, value)
		setters = append(setters, fmt.Sprintf("%s = $%d", column, len(args)))
	}
	if input.Title != nil {
		add("title", *input.Title)
	}
	if input.Description != nil {
		add("description", *input.Description)
	}
	if input.Status != nil {
		add("status", *input.Status)
	}
	if input.Priority != nil {
		add("priority", *input.Priority)
	}
	if input.DueDate != nil {
		add("due_date", *input.DueDate)
	}
	add("updated_at", time.Now().UTC())

	args = append(args, id)
	where := fmt.Sprintf(" WHERE id = $%d", len(args))
	if !isAdmin {
		args = append(args, userID)
		where += fmt.Sprintf(" AND user_id = $%d", len(args))
	}
	query := fmt.Sprintf(`
		UPDATE tasks SET %s %s
		RETURNING id, user_id, ''::text, title, description, status, priority, due_date, created_at, updated_at
	`, strings.Join(setters, ", "), where)
	return scanTask(r.pool.QueryRow(ctx, query, args...))
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanTask(row rowScanner) (Task, error) {
	var item Task
	var dueDate sql.NullTime
	err := row.Scan(&item.ID, &item.UserID, &item.UserEmail, &item.Title, &item.Description, &item.Status, &item.Priority, &dueDate, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Task{}, ErrTaskNotFound
	}
	if dueDate.Valid {
		item.DueDate = &dueDate.Time
	}
	return item, err
}

func ownedQuery(baseSQL, id, userID string, isAdmin bool) (string, []any) {
	args := []any{id}
	if isAdmin {
		return baseSQL, args
	}
	return baseSQL + " AND t.user_id = $2", append(args, userID)
}

func buildWhere(filter ListFilter) (string, []any) {
	clauses := []string{"1=1"}
	args := []any{}
	if !filter.IsAdmin {
		args = append(args, filter.UserID)
		clauses = append(clauses, fmt.Sprintf("t.user_id = $%d", len(args)))
	}
	if filter.Status != "" {
		args = append(args, filter.Status)
		clauses = append(clauses, fmt.Sprintf("t.status = $%d", len(args)))
	}
	if filter.Query != "" {
		args = append(args, "%"+filter.Query+"%")
		clauses = append(clauses, fmt.Sprintf("t.title ILIKE $%d", len(args)))
	}
	return " WHERE " + strings.Join(clauses, " AND "), args
}

func buildOrder(sort, direction string) string {
	// Sort and direction are normalized in the service before reaching this SQL fragment.
	if sort == "priority" {
		return "CASE t.priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 ELSE 4 END " + direction
	}
	if sort == "due_date" {
		return "t.due_date " + direction + " NULLS LAST"
	}
	return "t.created_at " + direction
}
