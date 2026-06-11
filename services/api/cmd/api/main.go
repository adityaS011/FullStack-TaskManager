package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"vector-task-api/internal/activity"
	"vector-task-api/internal/auth"
	"vector-task-api/internal/config"
	"vector-task-api/internal/database"
	"vector-task-api/internal/httpx"
	"vector-task-api/internal/realtime"
	"vector-task-api/internal/task"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg := config.Load()
	ctx := context.Background()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		logger.Error("database migration failed", "error", err)
		os.Exit(1)
	}

	userRepo := auth.NewRepository(pool)
	taskRepo := task.NewRepository(pool)
	activityRepo := activity.NewRepository(pool)
	authService := auth.NewService(userRepo, cfg.JWTSecret, cfg.AccessTokenTTL, cfg.AdminEmails)
	taskService := task.NewService(taskRepo)
	activityService := activity.NewService(activityRepo)
	realtimeHub := realtime.NewHub()
	hubCtx, stopHub := context.WithCancel(context.Background())
	defer stopHub()
	go realtimeHub.Run(hubCtx)

	server := &http.Server{
		Addr: ":" + cfg.Port,
		Handler: httpx.NewRouter(httpx.Dependencies{
			Activity: activityService, Auth: authService, Config: cfg,
			Realtime: realtimeHub, Tasks: taskService,
		}),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("api listening", "port", cfg.Port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
}
