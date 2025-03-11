package handlers

import (
	"time"
	
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/projectflow/models"
	"github.com/projectflow/utils/cache"
)

// Initialize cache for projects
var projectCache = cache.New()

// In-memory storage for development
var projects = make(map[uuid.UUID]*models.Project)
var projectMembers = make(map[uuid.UUID]map[uuid.UUID]*models.ProjectMember)

// CreateProject handles project creation
func CreateProject(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Parse request body
	var req models.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Create project
	projectID := uuid.New()
	project := &models.Project{
		ID:          projectID,
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
	}

	// Save project (in-memory for development)
	projects[projectID] = project

	// Add owner as a project member with admin role
	if projectMembers[projectID] == nil {
		projectMembers[projectID] = make(map[uuid.UUID]*models.ProjectMember)
	}
	projectMembers[projectID][userID] = &models.ProjectMember{
		ProjectID: projectID,
		UserID:    userID,
		Role:      "admin",
	}

	// Return project data
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"project": project,
	})
}

// GetAllProjects returns all projects the user has access to
func GetAllProjects(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get user's role
	role := c.Locals("role").(string)
	
	// Create a cache key based on user ID and role
	cacheKey := "projects_" + userID.String() + "_" + role
	
	// Try to get from cache first
	if cachedProjects, found := projectCache.Get(cacheKey); found {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"projects": cachedProjects,
		})
	}

	// If user is admin, return all projects
	var projectList []*models.Project
	if role == "admin" {
		for _, project := range projects {
			projectList = append(projectList, project)
		}
	} else {
		// Otherwise, return only projects the user is a member of
		for projectID, members := range projectMembers {
			if _, ok := members[userID]; ok {
				projectList = append(projectList, projects[projectID])
			}
		}
	}
	
	// Store in cache for 5 minutes
	projectCache.Set(cacheKey, projectList, 5*time.Minute)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"projects": projectList,
	})
}

// GetProjectByID returns a project by ID
func GetProjectByID(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("id")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}
	
	// Create a cache key based on project ID and user ID
	cacheKey := "project_" + id + "_user_" + userID.String()
	
	// Try to get from cache first
	if cachedData, found := projectCache.Get(cacheKey); found {
		return c.Status(fiber.StatusOK).JSON(cachedData)
	}

	// Find project
	project, ok := projects[projectID]
	if !ok {
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

	// Get project members
	var memberList []models.UserResponse
	for memberID := range projectMembers[projectID] {
		if user, ok := users[memberID]; ok {
			memberList = append(memberList, user.ToResponse())
		}
	}

	// Prepare response data
	responseData := fiber.Map{
		"project": project,
		"members": memberList,
	}
	
	// Store in cache for 5 minutes
	projectCache.Set(cacheKey, responseData, 5*time.Minute)

	// Return project data with members
	return c.Status(fiber.StatusOK).JSON(responseData)
}

// UpdateProject updates a project
func UpdateProject(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("id")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Find project
	project, ok := projects[projectID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user is project owner or admin
	role := c.Locals("role").(string)
	if role != "admin" && project.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only project owner or admin can update the project",
		})
	}

	// Parse request body
	var req models.UpdateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update project
	project.Name = req.Name
	project.Description = req.Description
	
	// Invalidate cache entries for this project
	projectCache.Delete("project_" + id + "_user_" + userID.String())
	
	// Also invalidate the projects list cache for this user
	projectCache.Delete("projects_" + userID.String() + "_" + role)

	// Return updated project
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"project": project,
	})
}

// DeleteProject deletes a project
func DeleteProject(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("id")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Find project
	project, ok := projects[projectID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user is project owner or admin
	role := c.Locals("role").(string)
	if role != "admin" && project.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only project owner or admin can delete the project",
		})
	}

	// Delete project
	delete(projects, projectID)
	delete(projectMembers, projectID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Project deleted successfully",
	})
}

// AddProjectMember adds a member to a project
func AddProjectMember(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	id := c.Params("id")
	projectID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Find project
	project, ok := projects[projectID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user is project owner or admin
	role := c.Locals("role").(string)
	if role != "admin" && project.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only project owner or admin can add members",
		})
	}

	// Parse request body
	var req models.AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if user exists
	if _, ok := users[req.UserID]; !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Check if user is already a member
	if projectMembers[projectID] == nil {
		projectMembers[projectID] = make(map[uuid.UUID]*models.ProjectMember)
	} else if _, ok := projectMembers[projectID][req.UserID]; ok {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "User is already a member of this project",
		})
	}

	// Add member
	projectMembers[projectID][req.UserID] = &models.ProjectMember{
		ProjectID: projectID,
		UserID:    req.UserID,
		Role:      req.Role,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Member added successfully",
	})
}

// RemoveProjectMember removes a member from a project
func RemoveProjectMember(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get project ID from URL parameter
	projectID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Get member ID from URL parameter
	memberID, err := uuid.Parse(c.Params("memberID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid member ID",
		})
	}

	// Find project
	project, ok := projects[projectID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Check if user is project owner or admin
	role := c.Locals("role").(string)
	if role != "admin" && project.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only project owner or admin can remove members",
		})
	}

	// Check if member exists
	if projectMembers[projectID] == nil || projectMembers[projectID][memberID] == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Member not found in this project",
		})
	}

	// Cannot remove the project owner
	if memberID == project.OwnerID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot remove the project owner",
		})
	}

	// Remove member
	delete(projectMembers[projectID], memberID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Member removed successfully",
	})
}
