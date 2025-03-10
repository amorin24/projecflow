package models

import (
	"time"

	"github.com/google/uuid"
)

// Project represents a project in the system
type Project struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     uuid.UUID `json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ProjectMember represents a user's membership in a project
type ProjectMember struct {
	ProjectID uuid.UUID `json:"project_id"`
	UserID    uuid.UUID `json:"user_id"`
	Role      string    `json:"role"` // admin or member
	JoinedAt  time.Time `json:"joined_at"`
}

// CreateProjectRequest represents the request to create a new project
type CreateProjectRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description"`
}

// UpdateProjectRequest represents the request to update a project
type UpdateProjectRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description"`
}

// ProjectResponse represents the project data with additional information
type ProjectResponse struct {
	ID          uuid.UUID      `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Owner       UserResponse   `json:"owner"`
	Members     []UserResponse `json:"members,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// AddMemberRequest represents the request to add a member to a project
type AddMemberRequest struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Role   string    `json:"role" validate:"required,oneof=admin member"`
}
