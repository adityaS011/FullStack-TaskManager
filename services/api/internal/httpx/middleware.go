package httpx

import (
	"context"
	"net/http"
	"strings"

	"vector-task-api/internal/auth"
)

type contextKey string

const userContextKey contextKey = "authUser"

func cors(origin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func requireAuth(service *auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerToken(r.Header.Get("Authorization"))
			if token == "" {
				writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.", nil)
				return
			}
			user, err := service.VerifyToken(token)
			if err != nil || user.ID == "" {
				writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.", nil)
				return
			}
			ctx := context.WithValue(r.Context(), userContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if currentUser(r).Role != "admin" {
			writeError(w, http.StatusForbidden, "FORBIDDEN", "Admin access is required.", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func currentUser(r *http.Request) auth.User {
	user, _ := r.Context().Value(userContextKey).(auth.User)
	return user
}

func bearerToken(header string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, prefix))
}
