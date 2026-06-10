package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type storedUser struct {
	user         User
	passwordHash string
}

type fakeUserStore struct {
	byEmail map[string]storedUser
	byID    map[string]storedUser
}

func newFakeUserStore() *fakeUserStore {
	return &fakeUserStore{byEmail: map[string]storedUser{}, byID: map[string]storedUser{}}
}

func (f *fakeUserStore) Create(ctx context.Context, name, email, passwordHash, role string) (User, error) {
	if _, exists := f.byEmail[email]; exists {
		return User{}, ErrUserExists
	}
	user := User{ID: "user-1", Name: name, Email: email, Role: role, CreatedAt: time.Now()}
	value := storedUser{user: user, passwordHash: passwordHash}
	f.byEmail[email] = value
	f.byID[user.ID] = value
	return user, nil
}

func (f *fakeUserStore) FindByEmail(ctx context.Context, email string) (User, string, error) {
	value, exists := f.byEmail[email]
	if !exists {
		return User{}, "", ErrUserNotFound
	}
	return value.user, value.passwordHash, nil
}

func (f *fakeUserStore) FindByID(ctx context.Context, id string) (User, error) {
	value, exists := f.byID[id]
	if !exists {
		return User{}, ErrUserNotFound
	}
	return value.user, nil
}

func TestSignUpHashesPasswordAndIssuesToken(t *testing.T) {
	store := newFakeUserStore()
	service := NewService(store, "test-secret", time.Hour, map[string]struct{}{"admin@example.com": {}})

	result, fields, err := service.SignUp(context.Background(), SignUpInput{
		Name: "Admin", Email: "ADMIN@example.com", Password: "password123",
	})
	if err != nil || fields.HasAny() {
		t.Fatalf("expected successful signup, got fields=%v err=%v", fields, err)
	}
	if result.User.Role != "admin" {
		t.Fatalf("expected admin role, got %q", result.User.Role)
	}
	stored := store.byEmail["admin@example.com"]
	if bcrypt.CompareHashAndPassword([]byte(stored.passwordHash), []byte("password123")) != nil {
		t.Fatal("expected stored password to be a valid bcrypt hash")
	}
	verified, err := service.VerifyToken(result.Token)
	if err != nil || verified.ID != result.User.ID {
		t.Fatalf("expected token to verify user, got user=%v err=%v", verified, err)
	}
}

func TestLoginRejectsBadPassword(t *testing.T) {
	store := newFakeUserStore()
	service := NewService(store, "test-secret", time.Hour, nil)
	_, _, _ = service.SignUp(context.Background(), SignUpInput{Name: "Ava", Email: "ava@example.com", Password: "password123"})

	_, _, err := service.Login(context.Background(), LoginInput{Email: "ava@example.com", Password: "wrong-pass"})
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected invalid credentials, got %v", err)
	}
}
