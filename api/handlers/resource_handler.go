package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/amorin24/projectflow/models"
)

type ResourceHandler struct {
	resourceRepo models.ResourceRepository
	userRepo     models.UserRepository
	projectRepo  models.ProjectRepository
	taskRepo     models.TaskRepository
}

func NewResourceHandler(
	resourceRepo models.ResourceRepository,
	userRepo models.UserRepository,
	projectRepo models.ProjectRepository,
	taskRepo models.TaskRepository,
) *ResourceHandler {
	return &ResourceHandler{
		resourceRepo: resourceRepo,
		userRepo:     userRepo,
		projectRepo:  projectRepo,
		taskRepo:     taskRepo,
	}
}

// GetUserAvailability returns the availability schedule for a user
func (h *ResourceHandler) GetUserAvailability(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	availability, err := h.resourceRepo.GetUserAvailability(userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user availability",
		})
	}

	return c.JSON(fiber.Map{
		"availability": availability,
	})
}

// CreateUserAvailability creates a new availability entry for a user
func (h *ResourceHandler) CreateUserAvailability(c *fiber.Ctx) error {
	var availability models.UserAvailability
	if err := c.BodyParser(&availability); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate user exists
	_, err := h.userRepo.GetUserByID(availability.UserID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Validate day of week
	if availability.DayOfWeek < 0 || availability.DayOfWeek > 6 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
		})
	}

	// Set timestamps
	now := time.Now()
	availability.CreatedAt = now
	availability.UpdatedAt = now

	if err := h.resourceRepo.CreateUserAvailability(&availability); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user availability",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"availability": availability,
	})
}

// UpdateUserAvailability updates an existing availability entry
func (h *ResourceHandler) UpdateUserAvailability(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid availability ID",
		})
	}

	var availability models.UserAvailability
	if err := c.BodyParser(&availability); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	availability.ID = id
	availability.UpdatedAt = time.Now()

	if err := h.resourceRepo.UpdateUserAvailability(&availability); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user availability",
		})
	}

	return c.JSON(fiber.Map{
		"availability": availability,
	})
}

// DeleteUserAvailability deletes an availability entry
func (h *ResourceHandler) DeleteUserAvailability(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid availability ID",
		})
	}

	if err := h.resourceRepo.DeleteUserAvailability(id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user availability",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Availability deleted successfully",
	})
}

// GetResourceAllocations returns resource allocations based on filters
func (h *ResourceHandler) GetResourceAllocations(c *fiber.Ctx) error {
	filters := make(map[string]interface{})

	// Parse query parameters for filtering
	if userID := c.Query("user_id"); userID != "" {
		userIDInt, err := strconv.Atoi(userID)
		if err == nil {
			filters["user_id"] = userIDInt
		}
	}

	if projectID := c.Query("project_id"); projectID != "" {
		projectIDInt, err := strconv.Atoi(projectID)
		if err == nil {
			filters["project_id"] = projectIDInt
		}
	}

	if taskID := c.Query("task_id"); taskID != "" {
		taskIDInt, err := strconv.Atoi(taskID)
		if err == nil {
			filters["task_id"] = taskIDInt
		}
	}

	allocations, err := h.resourceRepo.GetResourceAllocations(filters)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get resource allocations",
		})
	}

	return c.JSON(fiber.Map{
		"allocations": allocations,
	})
}

// GetResourceAllocationByID returns a specific resource allocation
func (h *ResourceHandler) GetResourceAllocationByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid allocation ID",
		})
	}

	allocation, err := h.resourceRepo.GetResourceAllocationByID(id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get resource allocation",
		})
	}

	if allocation == nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Resource allocation not found",
		})
	}

	return c.JSON(fiber.Map{
		"allocation": allocation,
	})
}

// CreateResourceAllocation creates a new resource allocation
func (h *ResourceHandler) CreateResourceAllocation(c *fiber.Ctx) error {
	var allocation models.ResourceAllocation
	if err := c.BodyParser(&allocation); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate user exists
	_, err := h.userRepo.GetUserByID(allocation.UserID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Validate project exists
	_, err = h.projectRepo.GetProjectByID(allocation.ProjectID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Validate task if provided
	if allocation.TaskID != nil {
		_, err = h.taskRepo.GetTaskByID(*allocation.TaskID)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Task not found",
			})
		}
	}

	// Validate allocation percentage
	if allocation.AllocationPercentage <= 0 || allocation.AllocationPercentage > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Allocation percentage must be between 1 and 100",
		})
	}

	// Set timestamps
	now := time.Now()
	allocation.CreatedAt = now
	allocation.UpdatedAt = now

	if err := h.resourceRepo.CreateResourceAllocation(&allocation); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create resource allocation",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"allocation": allocation,
	})
}

// UpdateResourceAllocation updates an existing resource allocation
func (h *ResourceHandler) UpdateResourceAllocation(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid allocation ID",
		})
	}

	var allocation models.ResourceAllocation
	if err := c.BodyParser(&allocation); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	allocation.ID = id
	allocation.UpdatedAt = time.Now()

	if err := h.resourceRepo.UpdateResourceAllocation(&allocation); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update resource allocation",
		})
	}

	return c.JSON(fiber.Map{
		"allocation": allocation,
	})
}

// DeleteResourceAllocation deletes a resource allocation
func (h *ResourceHandler) DeleteResourceAllocation(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid allocation ID",
		})
	}

	if err := h.resourceRepo.DeleteResourceAllocation(id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete resource allocation",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Resource allocation deleted successfully",
	})
}

// GetTimeOffRequests returns time off requests based on filters
func (h *ResourceHandler) GetTimeOffRequests(c *fiber.Ctx) error {
	filters := make(map[string]interface{})

	// Parse query parameters for filtering
	if userID := c.Query("user_id"); userID != "" {
		userIDInt, err := strconv.Atoi(userID)
		if err == nil {
			filters["user_id"] = userIDInt
		}
	}

	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	requests, err := h.resourceRepo.GetTimeOffRequests(filters)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get time off requests",
		})
	}

	return c.JSON(fiber.Map{
		"requests": requests,
	})
}

// GetTimeOffRequestByID returns a specific time off request
func (h *ResourceHandler) GetTimeOffRequestByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request ID",
		})
	}

	request, err := h.resourceRepo.GetTimeOffRequestByID(id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get time off request",
		})
	}

	if request == nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Time off request not found",
		})
	}

	return c.JSON(fiber.Map{
		"request": request,
	})
}

// CreateTimeOffRequest creates a new time off request
func (h *ResourceHandler) CreateTimeOffRequest(c *fiber.Ctx) error {
	var request models.TimeOffRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate user exists
	_, err := h.userRepo.GetUserByID(request.UserID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Set default status if not provided
	if request.Status == "" {
		request.Status = "pending"
	}

	// Set timestamps
	now := time.Now()
	request.CreatedAt = now
	request.UpdatedAt = now

	if err := h.resourceRepo.CreateTimeOffRequest(&request); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create time off request",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"request": request,
	})
}

// UpdateTimeOffRequest updates an existing time off request
func (h *ResourceHandler) UpdateTimeOffRequest(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request ID",
		})
	}

	var request models.TimeOffRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	request.ID = id
	request.UpdatedAt = time.Now()

	if err := h.resourceRepo.UpdateTimeOffRequest(&request); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update time off request",
		})
	}

	return c.JSON(fiber.Map{
		"request": request,
	})
}

// UpdateTimeOffRequestStatus updates the status of a time off request
func (h *ResourceHandler) UpdateTimeOffRequestStatus(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request ID",
		})
	}

	var statusUpdate struct {
		Status     string `json:"status"`
		ApprovedBy int    `json:"approved_by"`
	}

	if err := c.BodyParser(&statusUpdate); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get the existing request
	request, err := h.resourceRepo.GetTimeOffRequestByID(id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get time off request",
		})
	}

	if request == nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Time off request not found",
		})
	}

	// Update status
	request.Status = statusUpdate.Status
	request.UpdatedAt = time.Now()

	// If approved, set approved_by and approved_at
	if statusUpdate.Status == "approved" {
		request.ApprovedBy = &statusUpdate.ApprovedBy
		now := time.Now()
		request.ApprovedAt = &now
	}

	if err := h.resourceRepo.UpdateTimeOffRequest(request); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update time off request status",
		})
	}

	return c.JSON(fiber.Map{
		"request": request,
	})
}

// DeleteTimeOffRequest deletes a time off request
func (h *ResourceHandler) DeleteTimeOffRequest(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request ID",
		})
	}

	if err := h.resourceRepo.DeleteTimeOffRequest(id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete time off request",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Time off request deleted successfully",
	})
}

// GetResourceCalendar returns calendar data for resource planning
func (h *ResourceHandler) GetResourceCalendar(c *fiber.Ctx) error {
	// Parse date range
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Start date and end date are required",
		})
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid start date format (use YYYY-MM-DD)",
		})
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid end date format (use YYYY-MM-DD)",
		})
	}

	// Parse user IDs if provided
	var userIDs []int
	if userIDsStr := c.Query("user_ids"); userIDsStr != "" {
		userIDStrs := c.QueryParser().GetStringSlice("user_ids")
		for _, idStr := range userIDStrs {
			id, err := strconv.Atoi(idStr)
			if err == nil {
				userIDs = append(userIDs, id)
			}
		}
	}

	calendarData, err := h.resourceRepo.GetResourceCalendarData(startDate, endDate, userIDs)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get resource calendar data",
		})
	}

	return c.JSON(calendarData)
}
