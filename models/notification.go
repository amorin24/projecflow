package models

import (
	"time"

	"github.com/google/uuid"
)

// Notification represents a notification in the system
type Notification struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Content   string     `json:"content"`
	Type      string     `json:"type"` // task_assigned, comment_added, etc.
	Read      bool       `json:"read"`
	RelatedID *uuid.UUID `json:"related_id"` // Can be task_id, project_id, etc.
	CreatedAt time.Time  `json:"created_at"`
}

// NotificationResponse represents a notification with additional information
type NotificationResponse struct {
	ID        uuid.UUID  `json:"id"`
	Content   string     `json:"content"`
	Type      string     `json:"type"`
	Read      bool       `json:"read"`
	RelatedID *uuid.UUID `json:"related_id"`
	CreatedAt time.Time  `json:"created_at"`
}

// MarkNotificationReadRequest represents the request to mark a notification as read
type MarkNotificationReadRequest struct {
	Read bool `json:"read"`
}
