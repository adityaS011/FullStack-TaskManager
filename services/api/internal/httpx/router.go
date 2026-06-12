package httpx

import (
	"net/http"

	"vector-task-api/internal/activity"
	"vector-task-api/internal/attachment"
	"vector-task-api/internal/auth"
	"vector-task-api/internal/config"
	"vector-task-api/internal/realtime"
	"vector-task-api/internal/task"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Dependencies struct {
	Activity    *activity.Service
	Attachments *attachment.Service
	Auth        *auth.Service
	Config      config.Config
	Realtime    *realtime.Hub
	Tasks       *task.Service
}

func NewRouter(deps Dependencies) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(cors(deps.Config.CORSOrigin))

	authHandler := authEndpoints{service: deps.Auth}
	realtimeHandler := realtimeEndpoints{
		auth: deps.Auth, hub: deps.Realtime, origin: deps.Config.CORSOrigin,
	}
	taskHandler := taskEndpoints{activity: deps.Activity, events: deps.Realtime, service: deps.Tasks}
	activityHandler := activityEndpoints{activity: deps.Activity, tasks: deps.Tasks}
	attachmentHandler := attachmentEndpoints{
		activity: deps.Activity, attachments: deps.Attachments, events: deps.Realtime, tasks: deps.Tasks,
	}

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	r.Route("/auth", func(r chi.Router) {
		r.Post("/signup", authHandler.signUp)
		r.Post("/login", authHandler.login)
		r.With(requireAuth(deps.Auth)).Get("/me", authHandler.me)
	})
	r.Get("/ws/tasks", realtimeHandler.tasks)
	r.Group(func(r chi.Router) {
		r.Use(requireAuth(deps.Auth))
		r.Post("/tasks", taskHandler.create)
		r.Get("/tasks", taskHandler.list)
		r.Post("/tasks/{id}/attachments", attachmentHandler.upload)
		r.Get("/tasks/{id}/attachments", attachmentHandler.list)
		r.Get("/tasks/{id}/attachments/{attachmentID}/download", attachmentHandler.download)
		r.Delete("/tasks/{id}/attachments/{attachmentID}", attachmentHandler.delete)
		r.Get("/tasks/{id}/activity", activityHandler.list)
		r.Get("/tasks/{id}", taskHandler.get)
		r.Patch("/tasks/{id}", taskHandler.update)
		r.Delete("/tasks/{id}", taskHandler.delete)
		r.With(requireAdmin).Get("/admin/tasks", taskHandler.adminList)
	})
	return r
}
