package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"vector-task-api/internal/validation"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidToken       = errors.New("invalid token")
	ErrValidation         = errors.New("validation failed")
)

type UserStore interface {
	Create(ctx context.Context, name, email, passwordHash, role string) (User, error)
	FindByEmail(ctx context.Context, email string) (User, string, error)
	FindByID(ctx context.Context, id string) (User, error)
}

type Service struct {
	store       UserStore
	jwtSecret   []byte
	tokenTTL    time.Duration
	adminEmails map[string]struct{}
}

func NewService(store UserStore, secret string, ttl time.Duration, adminEmails map[string]struct{}) *Service {
	return &Service{store: store, jwtSecret: []byte(secret), tokenTTL: ttl, adminEmails: adminEmails}
}

func (s *Service) SignUp(ctx context.Context, input SignUpInput) (TokenPair, validation.FieldErrors, error) {
	fields := validateSignUp(input)
	if fields.HasAny() {
		return TokenPair{}, fields, ErrValidation
	}
	email := normalizeEmail(input.Email)
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return TokenPair{}, nil, err
	}
	role := "member"
	if _, ok := s.adminEmails[email]; ok {
		// Admins are configured through env rather than exposed as a public signup option.
		role = "admin"
	}
	user, err := s.store.Create(ctx, strings.TrimSpace(input.Name), email, string(passwordHash), role)
	if err != nil {
		return TokenPair{}, nil, err
	}
	token, err := s.issueToken(user)
	return TokenPair{Token: token, User: user}, nil, err
}

func (s *Service) Login(ctx context.Context, input LoginInput) (TokenPair, validation.FieldErrors, error) {
	fields := validation.FieldErrors{}
	if !validation.Email(input.Email) {
		fields.Add("email", "Enter a valid email address.")
	}
	if strings.TrimSpace(input.Password) == "" {
		fields.Add("password", "Password is required.")
	}
	if fields.HasAny() {
		return TokenPair{}, fields, ErrValidation
	}
	user, passwordHash, err := s.store.FindByEmail(ctx, normalizeEmail(input.Email))
	if err != nil {
		return TokenPair{}, nil, ErrInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)) != nil {
		return TokenPair{}, nil, ErrInvalidCredentials
	}
	token, err := s.issueToken(user)
	return TokenPair{Token: token, User: user}, nil, err
}

func (s *Service) Me(ctx context.Context, userID string) (User, error) {
	return s.store.FindByID(ctx, userID)
}

func (s *Service) VerifyToken(tokenValue string) (User, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenValue, claims, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	}, jwt.WithExpirationRequired(), jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil || !token.Valid {
		return User{}, ErrInvalidToken
	}
	return User{
		ID:    stringClaim(claims, "sub"),
		Name:  stringClaim(claims, "name"),
		Email: stringClaim(claims, "email"),
		Role:  stringClaim(claims, "role"),
	}, nil
}

func (s *Service) issueToken(user User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(s.tokenTTL).Unix(),
		"iat":   time.Now().Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}

func validateSignUp(input SignUpInput) validation.FieldErrors {
	fields := validation.FieldErrors{}
	if len(strings.TrimSpace(input.Name)) < 2 {
		fields.Add("name", "Name must be at least 2 characters.")
	}
	if !validation.Email(input.Email) {
		fields.Add("email", "Enter a valid email address.")
	}
	if !validation.Password(input.Password) {
		fields.Add("password", "Password must be at least 8 characters.")
	}
	return fields
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func stringClaim(claims jwt.MapClaims, key string) string {
	if value, ok := claims[key].(string); ok {
		return value
	}
	return ""
}
