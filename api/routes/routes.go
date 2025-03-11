package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/projectflow/api/handlers"
	"github.com/projectflow/api/middleware"
)

// SetupRoutes sets up all the routes for the application
func SetupRoutes(app *fiber.App) {
	// API group
	api := app.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/register", handlers.RegisterUser)
	auth.Post("/login", handlers.Login)
	auth.Get("/me", middleware.Protected(), handlers.GetCurrentUser)

	// User routes
	users := api.Group("/users", middleware.Protected())
	users.Get("/", middleware.AdminOnly(), handlers.GetAllUsers)
	users.Get("/:id", handlers.GetUserByID)

	// Project routes
	projects := api.Group("/projects", middleware.Protected())
	projects.Post("/", handlers.CreateProject)
	projects.Get("/", handlers.GetAllProjects)
	projects.Get("/:id", handlers.GetProjectByID)
	projects.Put("/:id", handlers.UpdateProject)
	projects.Delete("/:id", handlers.DeleteProject)
	projects.Post("/:id/members", handlers.AddProjectMember)
	projects.Delete("/:id/members/:memberID", handlers.RemoveProjectMember)

	// Task routes
	tasks := api.Group("/tasks", middleware.Protected())
	tasks.Post("/", handlers.CreateTask)
	tasks.Get("/project/:projectID", handlers.GetAllTasks)
	tasks.Get("/:id", handlers.GetTaskByID)
	tasks.Put("/:id", handlers.UpdateTask)
	tasks.Patch("/:id/status", handlers.UpdateTaskStatus)
	tasks.Delete("/:id", handlers.DeleteTask)
	tasks.Post("/:id/comments", handlers.AddTaskComment)

	// Task status routes
	statuses := api.Group("/statuses", middleware.Protected())
	statuses.Get("/project/:projectID", handlers.GetTaskStatuses)

	// Notification routes
	notifications := api.Group("/notifications", middleware.Protected())
	notifications.Get("/", handlers.GetUserNotifications)
	notifications.Patch("/:id", handlers.MarkNotificationRead)
	notifications.Patch("/", handlers.MarkAllNotificationsRead)
}
