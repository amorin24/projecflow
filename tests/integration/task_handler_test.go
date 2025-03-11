package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"projectflow/api/handlers"
	"projectflow/models"
)

// MockTaskRepository is a mock implementation of the task repository
type MockTaskRepository struct {
	mock.Mock
}

func (m *MockTaskRepository) Create(task *models.Task) error {
	args := m.Called(task)
	return args.Error(0)
}

func (m *MockTaskRepository) GetByID(id string) (*models.Task, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Task), args.Error(1)
}

func (m *MockTaskRepository) GetByProject(projectID string) ([]models.Task, error) {
	args := m.Called(projectID)
	return args.Get(0).([]models.Task), args.Error(1)
}

func (m *MockTaskRepository) Update(task *models.Task) error {
	args := m.Called(task)
	return args.Error(0)
}

func (m *MockTaskRepository) UpdateStatus(id string, statusID int) error {
	args := m.Called(id, statusID)
	return args.Error(0)
}

func (m *MockTaskRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func TestCreateTask(t *testing.T) {
	// Setup
	mockRepo := new(MockTaskRepository)
	app := fiber.New()
	
	// Create a handler with the mock repository
	taskHandler := &handlers.TaskHandler{
		TaskRepo: mockRepo,
	}
	
	// Setup route
	app.Post("/api/tasks", taskHandler.CreateTask)
	
	// Test data
	now := time.Now()
	dueDate := now.AddDate(0, 0, 7)
	
	task := models.Task{
		Title:       "Test Task",
		Description: "This is a test task",
		ProjectID:   1,
		StatusID:    1,
		Priority:    "medium",
		DueDate:     &dueDate,
		AssigneeID:  "user123",
	}
	
	// Mock expectations
	mockRepo.On("Create", mock.AnythingOfType("*models.Task")).Return(nil)
	
	// Convert task to JSON
	taskJSON, _ := json.Marshal(task)
	
	// Create request
	req := httptest.NewRequest(http.MethodPost, "/api/tasks", bytes.NewReader(taskJSON))
	req.Header.Set("Content-Type", "application/json")
	
	// Execute request
	resp, _ := app.Test(req)
	
	// Assertions
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	mockRepo.AssertExpectations(t)
}

func TestGetTask(t *testing.T) {
	// Setup
	mockRepo := new(MockTaskRepository)
	app := fiber.New()
	
	// Create a handler with the mock repository
	taskHandler := &handlers.TaskHandler{
		TaskRepo: mockRepo,
	}
	
	// Setup route
	app.Get("/api/tasks/:id", taskHandler.GetTask)
	
	// Test data
	now := time.Now()
	dueDate := now.AddDate(0, 0, 7)
	
	task := &models.Task{
		ID:          "task123",
		Title:       "Test Task",
		Description: "This is a test task",
		ProjectID:   1,
		StatusID:    1,
		Priority:    "medium",
		DueDate:     &dueDate,
		AssigneeID:  "user123",
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	
	// Mock expectations
	mockRepo.On("GetByID", "task123").Return(task, nil)
	
	// Create request
	req := httptest.NewRequest(http.MethodGet, "/api/tasks/task123", nil)
	
	// Execute request
	resp, _ := app.Test(req)
	
	// Assertions
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	mockRepo.AssertExpectations(t)
}
