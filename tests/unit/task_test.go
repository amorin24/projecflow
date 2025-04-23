package unit

import (
	"errors"
	"testing"
	"time"

	"github.com/amorin24/projecflow/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func validateTask(task models.Task) error {
	if task.Title == "" {
		return errors.New("title is required")
	}
	if task.ProjectID == uuid.Nil {
		return errors.New("project_id is required")
	}
	if task.StatusID == 0 {
		return errors.New("status_id is required")
	}
	if task.Priority != "low" && task.Priority != "medium" && task.Priority != "high" {
		return errors.New("priority must be low, medium, or high")
	}
	return nil
}

func beforeSaveTask(task *models.Task) error {
	now := time.Now()
	if task.CreatedAt.IsZero() {
		task.CreatedAt = now
	}
	task.UpdatedAt = now
	return nil
}

func TestTaskValidation(t *testing.T) {
	now := time.Now()
	pastDate := now.AddDate(0, 0, -10)
	futureDate := now.AddDate(0, 0, 10)
	
	projectID := uuid.New()
	
	tests := []struct {
		name     string
		task     models.Task
		isValid  bool
		errorMsg string
	}{
		{
			name: "Valid Task",
			task: models.Task{
				Title:       "Test Task",
				Description: "This is a test task",
				ProjectID:   projectID,
				StatusID:    1,
				Priority:    "medium",
				DueDate:     &futureDate,
			},
			isValid: true,
		},
		{
			name: "Empty Title",
			task: models.Task{
				Description: "This is a test task",
				ProjectID:   projectID,
				StatusID:    1,
				Priority:    "medium",
			},
			isValid:  false,
			errorMsg: "title is required",
		},
		{
			name: "Invalid Project ID",
			task: models.Task{
				Title:       "Test Task",
				Description: "This is a test task",
				ProjectID:   uuid.Nil,
				StatusID:    1,
				Priority:    "medium",
			},
			isValid:  false,
			errorMsg: "project_id is required",
		},
		{
			name: "Invalid Status ID",
			task: models.Task{
				Title:       "Test Task",
				Description: "This is a test task",
				ProjectID:   projectID,
				StatusID:    0,
				Priority:    "medium",
			},
			isValid:  false,
			errorMsg: "status_id is required",
		},
		{
			name: "Invalid Priority",
			task: models.Task{
				Title:       "Test Task",
				Description: "This is a test task",
				ProjectID:   projectID,
				StatusID:    1,
				Priority:    "invalid",
			},
			isValid:  false,
			errorMsg: "priority must be low, medium, or high",
		},
		{
			name: "Past Due Date",
			task: models.Task{
				Title:       "Test Task",
				Description: "This is a test task",
				ProjectID:   projectID,
				StatusID:    1,
				Priority:    "medium",
				DueDate:     &pastDate,
			},
			isValid: true, // We allow past due dates for overdue tasks
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateTask(tt.task)
			if tt.isValid {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
				if tt.errorMsg != "" {
					assert.Contains(t, err.Error(), tt.errorMsg)
				}
			}
		})
	}
}

func TestTaskBeforeSave(t *testing.T) {
	projectID := uuid.New()
	
	task := models.Task{
		Title:       "Test Task",
		Description: "This is a test task",
		ProjectID:   projectID,
		StatusID:    1,
		Priority:    "medium",
	}

	// Test timestamps using our mock function
	err := beforeSaveTask(&task)
	assert.NoError(t, err)
	assert.NotEmpty(t, task.CreatedAt, "CreatedAt should be set")
	assert.NotEmpty(t, task.UpdatedAt, "UpdatedAt should be set")
}
