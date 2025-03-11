package models

import (
	"time"
)

// UserAvailability represents a user's regular availability pattern
type UserAvailability struct {
	ID        int       `json:"id" db:"id"`
	UserID    int       `json:"user_id" db:"user_id"`
	DayOfWeek int       `json:"day_of_week" db:"day_of_week"` // 0 = Sunday, 1 = Monday, etc.
	StartTime time.Time `json:"start_time" db:"start_time"`
	EndTime   time.Time `json:"end_time" db:"end_time"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// ResourceAllocation represents the allocation of a user to a project or task
type ResourceAllocation struct {
	ID                   int       `json:"id" db:"id"`
	UserID               int       `json:"user_id" db:"user_id"`
	ProjectID            int       `json:"project_id" db:"project_id"`
	TaskID               *int      `json:"task_id,omitempty" db:"task_id"`
	AllocationPercentage int       `json:"allocation_percentage" db:"allocation_percentage"`
	StartDate            time.Time `json:"start_date" db:"start_date"`
	EndDate              time.Time `json:"end_date" db:"end_date"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
	
	// Populated fields (not from database)
	User    *User    `json:"user,omitempty" db:"-"`
	Project *Project `json:"project,omitempty" db:"-"`
	Task    *Task    `json:"task,omitempty" db:"-"`
}

// TimeOffRequest represents a request for time off
type TimeOffRequest struct {
	ID         int        `json:"id" db:"id"`
	UserID     int        `json:"user_id" db:"user_id"`
	StartDate  time.Time  `json:"start_date" db:"start_date"`
	EndDate    time.Time  `json:"end_date" db:"end_date"`
	RequestType string     `json:"request_type" db:"request_type"`
	Status     string     `json:"status" db:"status"`
	Notes      string     `json:"notes" db:"notes"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
	ApprovedBy *int       `json:"approved_by,omitempty" db:"approved_by"`
	ApprovedAt *time.Time `json:"approved_at,omitempty" db:"approved_at"`
	
	// Populated fields (not from database)
	User        *User `json:"user,omitempty" db:"-"`
	ApprovedByUser *User `json:"approved_by_user,omitempty" db:"-"`
}

// ResourceRepository defines the interface for resource-related database operations
type ResourceRepository interface {
	// User Availability
	GetUserAvailability(userID int) ([]UserAvailability, error)
	CreateUserAvailability(availability *UserAvailability) error
	UpdateUserAvailability(availability *UserAvailability) error
	DeleteUserAvailability(id int) error
	
	// Resource Allocations
	GetResourceAllocations(filters map[string]interface{}) ([]ResourceAllocation, error)
	GetResourceAllocationByID(id int) (*ResourceAllocation, error)
	CreateResourceAllocation(allocation *ResourceAllocation) error
	UpdateResourceAllocation(allocation *ResourceAllocation) error
	DeleteResourceAllocation(id int) error
	
	// Time Off Requests
	GetTimeOffRequests(filters map[string]interface{}) ([]TimeOffRequest, error)
	GetTimeOffRequestByID(id int) (*TimeOffRequest, error)
	CreateTimeOffRequest(request *TimeOffRequest) error
	UpdateTimeOffRequest(request *TimeOffRequest) error
	DeleteTimeOffRequest(id int) error
	
	// Calendar Data
	GetResourceCalendarData(startDate, endDate time.Time, userIDs []int) (map[string]interface{}, error)
}
