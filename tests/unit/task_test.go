package unit

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"projectflow/models"
)

func TestTaskValidation(t *testing.T) {
	now := time.Now()
	pastDate := now.AddDate(0, 0, -10)
	futureDate := now.AddDate(0, 0, 10)

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
				ProjectID:   1,
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
				ProjectID:   1,
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
				ProjectID:   0,
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
				ProjectID:   1,
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
				ProjectID:   1,
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
				ProjectID:   1,
				StatusID:    1,
				Priority:    "medium",
				DueDate:     &pastDate,
			},
			isValid: true, // We allow past due dates for overdue tasks
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.task.Validate()
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
	task := models.Task{
		Title:       "Test Task",
		Description: "This is a test task",
		ProjectID:   1,
		StatusID:    1,
		Priority:    "medium",
	}

	// Test timestamps
	err := task.BeforeSave()
	assert.NoError(t, err)
	assert.NotEmpty(t, task.CreatedAt, "CreatedAt should be set")
	assert.NotEmpty(t, task.UpdatedAt, "UpdatedAt should be set")
}
