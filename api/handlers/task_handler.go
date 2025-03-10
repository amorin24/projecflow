package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/projectflow/models"
)

// In-memory storage for development
var tasks = make(map[uuid.UUID]*models.Task)
var taskComments = make(map[uuid.UUID][]*models.TaskComment)
var taskStatuses = make(map[uuid.UUID][]*models.TaskStatus)

// Initialize default task statuses for a project
func initializeTaskStatuses(projectID uuid.UUID) {
	// Check if statuses already exist for this project
	if _, ok := taskStatuses[projectID]; ok {
		return
	}

	// Create default statuses
	taskStatuses[projectID] = []*models.TaskStatus{
		{ID: 1, Name: "To Do", DisplayOrder: 1, ProjectID: projectID},
		{ID: 2, Name: "In Progress", DisplayOrder: 2, ProjectID: projectID},
		{ID: 3, Name: "Done", DisplayOrder: 3, ProjectID: projectID},
	}
}

// CreateTask handles task creation
func CreateTask(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Parse request body
	var req models.CreateTaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if project exists
	if _, ok := projects[req.ProjectID]; !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[req.ProjectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this project",
			})
		}
	}

	// Initialize task statuses if not already done
	initializeTaskStatuses(req.ProjectID)

	// Validate status ID
	validStatus := false
	for _, status := range taskStatuses[req.ProjectID] {
		if status.ID == req.StatusID {
			validStatus = true
			break
		}
	}
	if !validStatus {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status ID",
		})
	}

	// Validate assignee if provided
	if req.AssigneeID != nil {
		// Check if assignee exists
		if _, ok := users[*req.AssigneeID]; !ok {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Assignee not found",
			})
		}

		// Check if assignee is a member of the project
		if members, ok := projectMembers[req.ProjectID]; !ok || members[*req.AssigneeID] == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Assignee is not a member of this project",
			})
		}
	}

	// Create task
	taskID := uuid.New()
	
	// Parse due date if provided
	var dueDate *time.Time
	if req.DueDate != nil && *req.DueDate != "" {
		// Try multiple date formats
		formats := []string{
			"2006-01-02",      // YYYY-MM-DD
			"01/02/2006",      // MM/DD/YYYY
			"02/01/2006",      // DD/MM/YYYY
			"2006/01/02",      // YYYY/MM/DD
			"January 2, 2006", // Month Day, Year
		}
		
		var parsedTime time.Time
		var parseErr error
		
		for _, format := range formats {
			parsedTime, parseErr = time.Parse(format, *req.DueDate)
			if parseErr == nil {
				// Validate the year is reasonable (between 1900 and 2100)
				if parsedTime.Year() >= 1900 && parsedTime.Year() <= 2100 {
					dueDate = &parsedTime
					break
				}
			}
		}
		
		if dueDate == nil {
			// Return error for invalid date format
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid date format or value",
				"details": "Please provide a valid date in YYYY-MM-DD format (e.g., 2025-03-20)",
			})
		}
	}
	
	task := &models.Task{
		ID:          taskID,
		Title:       req.Title,
		Description: req.Description,
		ProjectID:   req.ProjectID,
		StatusID:    req.StatusID,
		AssigneeID:  req.AssigneeID,
		ReporterID:  userID,
		DueDate:     dueDate,
		Priority:    req.Priority,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Save task (in-memory for development)
	tasks[taskID] = task

	// Create notification for assignee if assigned
	if req.AssigneeID != nil {
		// In a real app, we would send an email notification here
		// For now, just create an in-memory notification
		notificationID := uuid.New()
		notification := &models.Notification{
			ID:        notificationID,
			UserID:    *req.AssigneeID,
			Content:   "You have been assigned a new task: " + req.Title,
			Type:      "task_assigned",
			Read:      false,
			RelatedID: &taskID,
		}
		notifications[notificationID] = notification
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"task": task,
	})
}

// GetAllTasks returns all tasks in a project
func GetAllTasks(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("projectID")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Check if project exists
	if _, ok := projects[projectID]; !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[projectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this project",
			})
		}
	}

	// Get all tasks for the project
	var taskList []*models.Task
	for _, task := range tasks {
		if task.ProjectID == projectID {
			taskList = append(taskList, task)
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tasks": taskList,
	})
}

// GetTaskByID returns a task by ID
func GetTaskByID(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get task ID from URL parameter
	id := c.Params("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	// Find task
	task, ok := tasks[taskID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[task.ProjectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this task",
			})
		}
	}

	// Get task comments
	comments := taskComments[taskID]

	// Get task status
	var status *models.TaskStatus
	for _, s := range taskStatuses[task.ProjectID] {
		if s.ID == task.StatusID {
			status = s
			break
		}
	}

	// Get assignee if assigned
	var assignee *models.UserResponse
	if task.AssigneeID != nil {
		if user, ok := users[*task.AssigneeID]; ok {
			userResp := user.ToResponse()
			assignee = &userResp
		}
	}

	// Get reporter
	reporter, ok := users[task.ReporterID]
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Reporter not found",
		})
	}

	// Return task data with comments
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"task":     task,
		"status":   status,
		"assignee": assignee,
		"reporter": reporter.ToResponse(),
		"comments": comments,
	})
}

// UpdateTask updates a task
func UpdateTask(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get task ID from URL parameter
	id := c.Params("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	// Find task
	task, ok := tasks[taskID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[task.ProjectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this task",
			})
		}
	}

	// Parse request body
	var req models.UpdateTaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate status ID
	validStatus := false
	for _, status := range taskStatuses[task.ProjectID] {
		if status.ID == req.StatusID {
			validStatus = true
			break
		}
	}
	if !validStatus {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status ID",
		})
	}

	// Validate assignee if provided
	if req.AssigneeID != nil {
		// Check if assignee exists
		if _, ok := users[*req.AssigneeID]; !ok {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Assignee not found",
			})
		}

		// Check if assignee is a member of the project
		if members, ok := projectMembers[task.ProjectID]; !ok || members[*req.AssigneeID] == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Assignee is not a member of this project",
			})
		}
	}

	// Check if assignee has changed
	var oldAssigneeID *uuid.UUID
	if task.AssigneeID != nil {
		oldAssigneeID = task.AssigneeID
	}

	// Update task
	task.Title = req.Title
	task.Description = req.Description
	task.StatusID = req.StatusID
	task.AssigneeID = req.AssigneeID
	task.DueDate = req.DueDate
	task.Priority = req.Priority

	// Create notification for new assignee if changed
	if req.AssigneeID != nil && (oldAssigneeID == nil || *oldAssigneeID != *req.AssigneeID) {
		// In a real app, we would send an email notification here
		// For now, just create an in-memory notification
		notificationID := uuid.New()
		notification := &models.Notification{
			ID:        notificationID,
			UserID:    *req.AssigneeID,
			Content:   "You have been assigned a task: " + task.Title,
			Type:      "task_assigned",
			Read:      false,
			RelatedID: &taskID,
		}
		notifications[notificationID] = notification
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"task": task,
	})
}

// UpdateTaskStatus updates a task's status
func UpdateTaskStatus(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get task ID from URL parameter
	id := c.Params("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	// Find task
	task, ok := tasks[taskID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[task.ProjectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this task",
			})
		}
	}

	// Parse request body
	var req models.UpdateTaskStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate status ID
	validStatus := false
	for _, status := range taskStatuses[task.ProjectID] {
		if status.ID == req.StatusID {
			validStatus = true
			break
		}
	}
	if !validStatus {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status ID",
		})
	}

	// Update task status
	task.StatusID = req.StatusID

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"task": task,
	})
}

// DeleteTask deletes a task
func DeleteTask(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get task ID from URL parameter
	id := c.Params("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	// Find task
	task, ok := tasks[taskID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	// Check if user is project owner, task reporter, or admin
	role := c.Locals("role").(string)
	project, ok := projects[task.ProjectID]
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	if role != "admin" && project.OwnerID != userID && task.ReporterID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only project owner, task reporter, or admin can delete the task",
		})
	}

	// Delete task
	delete(tasks, taskID)
	delete(taskComments, taskID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Task deleted successfully",
	})
}

// AddTaskComment adds a comment to a task
func AddTaskComment(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get task ID from URL parameter
	id := c.Params("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	// Find task
	task, ok := tasks[taskID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[task.ProjectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this task",
			})
		}
	}

	// Parse request body
	var req models.CreateCommentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Create comment
	commentID := uuid.New()
	comment := &models.TaskComment{
		ID:      commentID,
		TaskID:  taskID,
		UserID:  userID,
		Content: req.Content,
	}

	// Save comment (in-memory for development)
	if taskComments[taskID] == nil {
		taskComments[taskID] = []*models.TaskComment{}
	}
	taskComments[taskID] = append(taskComments[taskID], comment)

	// Create notification for task assignee if different from commenter
	if task.AssigneeID != nil && *task.AssigneeID != userID {
		// In a real app, we would send an email notification here
		// For now, just create an in-memory notification
		notificationID := uuid.New()
		notification := &models.Notification{
			ID:        notificationID,
			UserID:    *task.AssigneeID,
			Content:   "New comment on task: " + task.Title,
			Type:      "comment_added",
			Read:      false,
			RelatedID: &taskID,
		}
		notifications[notificationID] = notification
	}

	// Create notification for task reporter if different from commenter and assignee
	if task.ReporterID != userID && (task.AssigneeID == nil || task.ReporterID != *task.AssigneeID) {
		// In a real app, we would send an email notification here
		// For now, just create an in-memory notification
		notificationID := uuid.New()
		notification := &models.Notification{
			ID:        notificationID,
			UserID:    task.ReporterID,
			Content:   "New comment on task: " + task.Title,
			Type:      "comment_added",
			Read:      false,
			RelatedID: &taskID,
		}
		notifications[notificationID] = notification
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"comment": comment,
	})
}

// GetTaskStatuses returns all task statuses for a project
func GetTaskStatuses(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("projectID")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Check if project exists
	if _, ok := projects[projectID]; !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user has access to the project
	role := c.Locals("role").(string)
	if role != "admin" {
		if members, ok := projectMembers[projectID]; !ok || members[userID] == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You don't have access to this project",
			})
		}
	}

	// Initialize task statuses if not already done
	initializeTaskStatuses(projectID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"statuses": taskStatuses[projectID],
	})
}
