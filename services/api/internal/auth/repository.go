package auth

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrUserExists   = errors.New("user already exists")
	ErrUserNotFound = errors.New("user not found")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, name, email, passwordHash, role string) (User, error) {
	var user User
	err := r.pool.QueryRow(ctx, `
		INSERT INTO users (name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, email, role, created_at
	`, name, email, passwordHash, role).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	if err == nil {
		return user, nil
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return User{}, ErrUserExists
	}
	return User{}, err
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (User, string, error) {
	var user User
	var passwordHash string
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, email, role, created_at, password_hash
		FROM users
		WHERE email = $1
	`, email).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt, &passwordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, "", ErrUserNotFound
	}
	return user, passwordHash, err
}

func (r *Repository) FindByID(ctx context.Context, id string) (User, error) {
	var user User
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, email, role, created_at
		FROM users
		WHERE id = $1
	`, id).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrUserNotFound
	}
	return user, err
}
