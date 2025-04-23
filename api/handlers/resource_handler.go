package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/amorin24/projecflow/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ResourceHandler handles resource allocation and availability endpoints
type ResourceHandler struct {
	DB *sql.DB
}

// NewResourceHandler creates a new resource handler
func NewResourceHandler(db *sql.DB) *ResourceHandler {
	return &ResourceHandler{DB: db}
}

// GetResourceAllocations returns all resource allocations with optional filtering
func (h *ResourceHandler) GetResourceAllocations(c *fiber.Ctx) error {
	// Get query parameters for filtering
	userID := c.Query("user_id")
	projectID := c.Query("project_id")
	
	query := `SELECT id, user_id, project_id, allocation_percentage, 
			  start_date, end_date, created_at, updated_at 
			  FROM resource_allocations WHERE 1=1`
	
	args := []interface{}{}
	
	if userID != "" {
		query += " AND user_id = $" + strconv.Itoa(len(args)+1)
		userUUID, err := uuid.Parse(userID)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid user ID",
			})
		}
		args = append(args, userUUID)
	}
	
	if projectID != "" {
		query += " AND project_id = $" + strconv.Itoa(len(args)+1)
		projectUUID, err := uuid.Parse(projectID)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid project ID",
			})
		}
		args = append(args, projectUUID)
	}
	
	query += " ORDER BY start_date DESC"
	
	rows, err := h.DB.Query(query, args...)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch resource allocations",
		})
	}
	defer rows.Close()
	
	allocations := []models.ResourceAllocation{}
	
	for rows.Next() {
		var allocation models.ResourceAllocation
		var endDateNull sql.NullTime
		
		err := rows.Scan(
			&allocation.ID,
			&allocation.UserID,
			&allocation.ProjectID,
			&allocation.AllocationPercentage,
			&allocation.StartDate,
			&endDateNull,
			&allocation.CreatedAt,
			&allocation.UpdatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to scan resource allocation",
			})
		}
		
		if endDateNull.Valid {
			allocation.EndDate = endDateNull.Time
		}
		
		// Fetch user and project details
		allocation.User = &models.User{}
		err = h.DB.QueryRow(`
			SELECT id, username, email, full_name, role, created_at 
			FROM users WHERE id = $1
		`, allocation.UserID).Scan(
			&allocation.User.ID,
			&allocation.User.Username,
			&allocation.User.Email,
			&allocation.User.FullName,
			&allocation.User.Role,
			&allocation.User.CreatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch user details",
			})
		}
		
		allocation.Project = &models.Project{}
		err = h.DB.QueryRow(`
			SELECT id, name, description, owner_id, created_at, updated_at 
			FROM projects WHERE id = $1
		`, allocation.ProjectID).Scan(
			&allocation.Project.ID,
			&allocation.Project.Name,
			&allocation.Project.Description,
			&allocation.Project.OwnerID,
			&allocation.Project.CreatedAt,
			&allocation.Project.UpdatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch project details",
			})
		}
		
		allocations = append(allocations, allocation)
	}
	
	return c.JSON(fiber.Map{
		"allocations": allocations,
	})
}

// CreateResourceAllocation creates a new resource allocation
func (h *ResourceHandler) CreateResourceAllocation(c *fiber.Ctx) error {
	var allocation models.ResourceAllocation
	
	if err := c.BodyParser(&allocation); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}
	
	// Validate required fields
	if allocation.UserID == uuid.Nil || allocation.ProjectID == uuid.Nil || 
		allocation.AllocationPercentage <= 0 || allocation.AllocationPercentage > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid allocation data",
		})
	}
	
	// Check for overlapping allocations
	var totalAllocation int
	err := h.DB.QueryRow(`
		SELECT COALESCE(SUM(allocation_percentage), 0)
		FROM resource_allocations
		WHERE user_id = $1
		AND (
			(start_date <= $2 AND (end_date IS NULL OR end_date >= $2))
			OR (start_date <= $3 AND (end_date IS NULL OR end_date >= $3))
			OR (start_date >= $2 AND start_date <= $3)
		)
	`, allocation.UserID, allocation.StartDate, allocation.EndDate).Scan(&totalAllocation)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check allocation overlap",
		})
	}
	
	if totalAllocation+allocation.AllocationPercentage > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Total allocation percentage exceeds 100%",
		})
	}
	
	query := `
		INSERT INTO resource_allocations 
		(user_id, project_id, allocation_percentage, start_date, end_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	
	var endDateParam interface{} = nil
	if !allocation.EndDate.IsZero() {
		endDateParam = allocation.EndDate
	}
	
	err = h.DB.QueryRow(
		query,
		allocation.UserID,
		allocation.ProjectID,
		allocation.AllocationPercentage,
		allocation.StartDate,
		endDateParam,
	).Scan(
		&allocation.ID,
		&allocation.CreatedAt,
		&allocation.UpdatedAt,
	)
	
	if err != nil {
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
			"error": "Failed to parse request body",
		})
	}
	
	// Validate allocation percentage
	if allocation.AllocationPercentage <= 0 || allocation.AllocationPercentage > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid allocation percentage",
		})
	}
	
	// Check for overlapping allocations excluding current allocation
	var totalAllocation int
	err = h.DB.QueryRow(`
		SELECT COALESCE(SUM(allocation_percentage), 0)
		FROM resource_allocations
		WHERE user_id = $1
		AND id != $2
		AND (
			(start_date <= $3 AND (end_date IS NULL OR end_date >= $3))
			OR (start_date <= $4 AND (end_date IS NULL OR end_date >= $4))
			OR (start_date >= $3 AND start_date <= $4)
		)
	`, allocation.UserID, id, allocation.StartDate, allocation.EndDate).Scan(&totalAllocation)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check allocation overlap",
		})
	}
	
	if totalAllocation+allocation.AllocationPercentage > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Total allocation percentage exceeds 100%",
		})
	}
	
	var endDateParam interface{} = nil
	if !allocation.EndDate.IsZero() {
		endDateParam = allocation.EndDate
	}
	
	query := `
		UPDATE resource_allocations
		SET allocation_percentage = $1,
			start_date = $2,
			end_date = $3,
			updated_at = NOW()
		WHERE id = $4
		RETURNING created_at, updated_at
	`
	
	err = h.DB.QueryRow(
		query,
		allocation.AllocationPercentage,
		allocation.StartDate,
		endDateParam,
		id,
	).Scan(&allocation.CreatedAt, &allocation.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Resource allocation not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update resource allocation",
		})
	}
	
	allocation.ID = id
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
	
	result, err := h.DB.Exec("DELETE FROM resource_allocations WHERE id = $1", id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete resource allocation",
		})
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get rows affected",
		})
	}
	
	if rowsAffected == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Resource allocation not found",
		})
	}
	
	return c.SendStatus(http.StatusNoContent)
}

// GetUserAvailability returns a user's availability schedule
func (h *ResourceHandler) GetUserAvailability(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	if userID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}
	
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}
	
	rows, err := h.DB.Query(`
		SELECT id, day_of_week, start_time, end_time, created_at, updated_at
		FROM user_availability
		WHERE user_id = $1
		ORDER BY day_of_week, start_time
	`, userUUID)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch user availability",
		})
	}
	defer rows.Close()
	
	availability := []models.UserAvailability{}
	
	for rows.Next() {
		var schedule models.UserAvailability
		err := rows.Scan(
			&schedule.ID,
			&schedule.DayOfWeek,
			&schedule.StartTime,
			&schedule.EndTime,
			&schedule.CreatedAt,
			&schedule.UpdatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to scan user availability",
			})
		}
		
		schedule.UserID = userUUID
		availability = append(availability, schedule)
	}
	
	return c.JSON(fiber.Map{
		"availability": availability,
	})
}

// SetUserAvailability sets a user's availability schedule
func (h *ResourceHandler) SetUserAvailability(c *fiber.Ctx) error {
	var availability models.UserAvailability
	
	if err := c.BodyParser(&availability); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}
	
	// Validate fields
	if availability.UserID == uuid.Nil || 
		availability.DayOfWeek < 0 || availability.DayOfWeek > 6 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid availability data",
		})
	}
	
	// Check for overlapping time slots
	var count int
	err := h.DB.QueryRow(`
		SELECT COUNT(*)
		FROM user_availability
		WHERE user_id = $1
		AND day_of_week = $2
		AND (
			(start_time <= $3 AND end_time >= $3)
			OR (start_time <= $4 AND end_time >= $4)
			OR (start_time >= $3 AND end_time <= $4)
		)
	`, availability.UserID, availability.DayOfWeek, availability.StartTime, availability.EndTime).Scan(&count)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check time slot overlap",
		})
	}
	
	if count > 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Overlapping time slot exists",
		})
	}
	
	query := `
		INSERT INTO user_availability 
		(user_id, day_of_week, start_time, end_time, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	
	err = h.DB.QueryRow(
		query,
		availability.UserID,
		availability.DayOfWeek,
		availability.StartTime,
		availability.EndTime,
	).Scan(
		&availability.ID,
		&availability.CreatedAt,
		&availability.UpdatedAt,
	)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to set user availability",
		})
	}
	
	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"availability": availability,
	})
}

// CreateTimeOffRequest creates a new time off request
func (h *ResourceHandler) CreateTimeOffRequest(c *fiber.Ctx) error {
	var request models.TimeOffRequest
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}
	
	// Validate fields
	if request.UserID == uuid.Nil || request.StartDate.IsZero() || request.EndDate.IsZero() {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}
	
	if request.StartDate.After(request.EndDate) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Start date must be before end date",
		})
	}
	
	// Check for overlapping requests
	var count int
	err := h.DB.QueryRow(`
		SELECT COUNT(*)
		FROM time_off_requests
		WHERE user_id = $1
		AND status != 'rejected'
		AND (
			(start_date <= $2 AND end_date >= $2)
			OR (start_date <= $3 AND end_date >= $3)
			OR (start_date >= $2 AND end_date <= $3)
		)
	`, request.UserID, request.StartDate, request.EndDate).Scan(&count)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check request overlap",
		})
	}
	
	if count > 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Overlapping time off request exists",
		})
	}
	
	query := `
		INSERT INTO time_off_requests 
		(user_id, start_date, end_date, status, request_type, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	
	err = h.DB.QueryRow(
		query,
		request.UserID,
		request.StartDate,
		request.EndDate,
		"pending",
		request.RequestType,
		request.Notes,
	).Scan(
		&request.ID,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create time off request",
		})
	}
	
	return c.Status(http.StatusCreated).JSON(fiber.Map{
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
		Status string `json:"status"`
	}
	
	if err := c.BodyParser(&statusUpdate); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}
	
	// Validate status
	validStatuses := map[string]bool{"pending": true, "approved": true, "rejected": true}
	if !validStatuses[statusUpdate.Status] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status",
		})
	}
	
	query := `
		UPDATE time_off_requests
		SET status = $1,
			updated_at = NOW()
		WHERE id = $2
		RETURNING user_id, start_date, end_date, request_type, notes, created_at, updated_at
	`
	
	var request models.TimeOffRequest
	request.ID = id
	request.Status = statusUpdate.Status
	
	err = h.DB.QueryRow(
		query,
		statusUpdate.Status,
		id,
	).Scan(
		&request.UserID,
		&request.StartDate,
		&request.EndDate,
		&request.RequestType,
		&request.Notes,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Time off request not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update time off request status",
		})
	}
	
	return c.JSON(fiber.Map{
		"request": request,
	})
}

// GetTimeOffRequests returns time off requests with optional filtering
func (h *ResourceHandler) GetTimeOffRequests(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	status := c.Query("status")
	
	query := `
		SELECT id, user_id, start_date, end_date, status, request_type, notes, created_at, updated_at
		FROM time_off_requests
		WHERE 1=1
	`
	
	args := []interface{}{}
	
	if userID != "" {
		query += " AND user_id = $" + strconv.Itoa(len(args)+1)
		userUUID, err := uuid.Parse(userID)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid user ID",
			})
		}
		args = append(args, userUUID)
	}
	
	if status != "" {
		query += " AND status = $" + strconv.Itoa(len(args)+1)
		args = append(args, status)
	}
	
	query += " ORDER BY start_date DESC"
	
	rows, err := h.DB.Query(query, args...)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch time off requests",
		})
	}
	defer rows.Close()
	
	requests := []models.TimeOffRequest{}
	
	for rows.Next() {
		var request models.TimeOffRequest
		err := rows.Scan(
			&request.ID,
			&request.UserID,
			&request.StartDate,
			&request.EndDate,
			&request.Status,
			&request.RequestType,
			&request.Notes,
			&request.CreatedAt,
			&request.UpdatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to scan time off request",
			})
		}
		
		// Fetch user details
		request.User = &models.User{}
		err = h.DB.QueryRow(`
			SELECT id, username, email, full_name, role, created_at
			FROM users WHERE id = $1
		`, request.UserID).Scan(
			&request.User.ID,
			&request.User.Username,
			&request.User.Email,
			&request.User.FullName,
			&request.User.Role,
			&request.User.CreatedAt,
		)
		
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch user details",
			})
		}
		
		requests = append(requests, request)
	}
	
	return c.JSON(fiber.Map{
		"requests": requests,
	})
}
