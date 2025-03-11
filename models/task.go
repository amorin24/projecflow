package models

import (
	"time"

	"github.com/google/uuid"
)

// TaskStatus represents a status column in the Kanban board
type TaskStatus struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	DisplayOrder int       `json:"display_order"`
	ProjectID    uuid.UUID `json:"project_id"`
}

// Task represents a task in the system
type Task struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	ProjectID   uuid.UUID  `json:"project_id"`
	StatusID    int        `json:"status_id"`
	AssigneeID  *uuid.UUID `json:"assignee_id"` // Nullable
	ReporterID  uuid.UUID  `json:"reporter_id"`
	DueDate     *time.Time `json:"due_date"` // Nullable
	Priority    string     `json:"priority"` // low, medium, high
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// TaskComment represents a comment on a task
type TaskComment struct {
	ID        uuid.UUID `json:"id"`
	TaskID    uuid.UUID `json:"task_id"`
	UserID    uuid.UUID `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateTaskRequest represents the request to create a new task
type CreateTaskRequest struct {
	Title       string     `json:"title" validate:"required,min=3,max=200"`
	Description string     `json:"description"`
	ProjectID   uuid.UUID  `json:"project_id" validate:"required"`
	StatusID    int        `json:"status_id" validate:"required"`
	AssigneeID  *uuid.UUID `json:"assignee_id"`
	DueDate     *string    `json:"due_date"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high"`
}

// UpdateTaskRequest represents the request to update a task
type UpdateTaskRequest struct {
	Title       string     `json:"title" validate:"required,min=3,max=200"`
	Description string     `json:"description"`
	StatusID    int        `json:"status_id" validate:"required"`
	AssigneeID  *uuid.UUID `json:"assignee_id"`
	DueDate     *string    `json:"due_date"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high"`
}

// UpdateTaskStatusRequest represents the request to update a task's status
type UpdateTaskStatusRequest struct {
	StatusID int `json:"status_id" validate:"required"`
}

// TaskResponse represents the task data with additional information
type TaskResponse struct {
	ID          uuid.UUID      `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Project     ProjectResponse `json:"project"`
	Status      TaskStatus     `json:"status"`
	Assignee    *UserResponse  `json:"assignee,omitempty"`
	Reporter    UserResponse   `json:"reporter"`
	DueDate     *time.Time     `json:"due_date"`
	Priority    string         `json:"priority"`
	Comments    []CommentResponse `json:"comments,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// CreateCommentRequest represents the request to create a new comment
type CreateCommentRequest struct {
	Content string `json:"content" validate:"required"`
}

// CommentResponse represents a comment with user information
type CommentResponse struct {
	ID        uuid.UUID    `json:"id"`
	Content   string       `json:"content"`
	User      UserResponse `json:"user"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}
