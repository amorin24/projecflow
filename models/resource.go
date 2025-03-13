package models

import (
  "time"

  "github.com/google/uuid"
)

// UserAvailability represents a user's regular availability schedule
type UserAvailability struct {
  ID        int       `json:"id" db:"id"`
  UserID    uuid.UUID `json:"user_id" db:"user_id"`
  DayOfWeek int       `json:"day_of_week" db:"day_of_week"` // 0-6 for Sunday-Saturday
  StartTime time.Time `json:"start_time" db:"start_time"`
  EndTime   time.Time `json:"end_time" db:"end_time"`
  CreatedAt time.Time `json:"created_at" db:"created_at"`
  UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// ResourceAllocation represents a user's allocation to a project
type ResourceAllocation struct {
  ID                   int       `json:"id" db:"id"`
  UserID               uuid.UUID `json:"user_id" db:"user_id"`
  ProjectID            uuid.UUID `json:"project_id" db:"project_id"`
  AllocationPercentage int       `json:"allocation_percentage" db:"allocation_percentage"`
  StartDate            time.Time `json:"start_date" db:"start_date"`
  EndDate              time.Time `json:"end_date,omitempty" db:"end_date"`
  CreatedAt            time.Time `json:"created_at" db:"created_at"`
  UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
  
  // Populated fields (not from DB)
  User    *User    `json:"user,omitempty" db:"-"`
  Project *Project `json:"project,omitempty" db:"-"`
}

// TimeOffRequest represents a user's request for time off
type TimeOffRequest struct {
  ID          int       `json:"id" db:"id"`
  UserID      uuid.UUID `json:"user_id" db:"user_id"`
  StartDate   time.Time `json:"start_date" db:"start_date"`
  EndDate     time.Time `json:"end_date" db:"end_date"`
  Status      string    `json:"status" db:"status"` // pending, approved, rejected
  RequestType string    `json:"request_type" db:"request_type"`
  Notes       string    `json:"notes,omitempty" db:"notes"`
  CreatedAt   time.Time `json:"created_at" db:"created_at"`
  UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
  
  // Populated fields (not from DB)
  User *User `json:"user,omitempty" db:"-"`
}

// ResourceAllocationResponse is the API response for resource allocations
type ResourceAllocationResponse struct {
  ID                   int       `json:"id"`
  User                 User      `json:"user"`
  Project              Project   `json:"project"`
  AllocationPercentage int       `json:"allocation_percentage"`
  StartDate            time.Time `json:"start_date"`
  EndDate              time.Time `json:"end_date,omitempty"`
  CreatedAt            time.Time `json:"created_at"`
  UpdatedAt            time.Time `json:"updated_at"`
}

// TimeOffRequestResponse is the API response for time off requests
type TimeOffRequestResponse struct {
  ID          int       `json:"id"`
  User        User      `json:"user"`
  StartDate   time.Time `json:"start_date"`
  EndDate     time.Time `json:"end_date"`
  Status      string    `json:"status"`
  RequestType string    `json:"request_type"`
  Notes       string    `json:"notes,omitempty"`
  CreatedAt   time.Time `json:"created_at"`
  UpdatedAt   time.Time `json:"updated_at"`
}

// UserAvailabilityResponse is the API response for user availability
type UserAvailabilityResponse struct {
  ID        int       `json:"id"`
  User      User      `json:"user"`
  DayOfWeek int       `json:"day_of_week"`
  StartTime time.Time `json:"start_time"`
  EndTime   time.Time `json:"end_time"`
  CreatedAt time.Time `json:"created_at"`
  UpdatedAt time.Time `json:"updated_at"`
}
