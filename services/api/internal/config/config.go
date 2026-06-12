package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	CORSOrigin      string
	AdminEmails     map[string]struct{}
	UploadDir       string
	AccessTokenTTL  time.Duration
	ShutdownTimeout time.Duration
}

func Load() Config {
	return Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/vector_tasks?sslmode=disable"),
		JWTSecret:       getEnv("JWT_SECRET", "change-me-in-production"),
		CORSOrigin:      getEnv("CORS_ORIGIN", "http://localhost:3000"),
		AdminEmails:     parseEmailSet(os.Getenv("ADMIN_EMAILS")),
		UploadDir:       getEnv("UPLOAD_DIR", "./.data/uploads"),
		AccessTokenTTL:  getDuration("ACCESS_TOKEN_TTL", 24*time.Hour),
		ShutdownTimeout: getDuration("SHUTDOWN_TIMEOUT", 10*time.Second),
	}
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func getDuration(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	duration, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return duration
}

func parseEmailSet(value string) map[string]struct{} {
	result := map[string]struct{}{}
	for _, email := range strings.Split(value, ",") {
		normalized := strings.ToLower(strings.TrimSpace(email))
		if normalized != "" {
			result[normalized] = struct{}{}
		}
	}
	return result
}
