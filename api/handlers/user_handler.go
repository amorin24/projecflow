package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/projectflow/models"
	"github.com/projectflow/utils"
	"golang.org/x/crypto/bcrypt"
)

// In-memory storage for development
var users = make(map[uuid.UUID]*models.User)

// RegisterUser handles user registration
func RegisterUser(c *fiber.Ctx) error {
	// Parse request body
	var req models.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	// In a real app, we would use a validation library here

	// Check if email already exists
	for _, user := range users {
		if user.Email == req.Email {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email already registered",
			})
		}
		if user.Username == req.Username {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Username already taken",
			})
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create user
	userID := uuid.New()
	user := &models.User{
		ID:           userID,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Role:         req.Role,
	}

	// Save user (in-memory for development)
	users[userID] = user

	// Generate JWT token
	token, err := utils.GenerateToken(userID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Return user data and token
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":  user.ToResponse(),
		"token": token,
	})
}

// Login handles user login
func Login(c *fiber.Ctx) error {
	// Parse request body
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	var user *models.User
	for _, u := range users {
		if u.Email == req.Email {
			user = u
			break
		}
	}

	// Check if user exists
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Verify password
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Return user data and token
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user":  user.ToResponse(),
		"token": token,
	})
}

// GetCurrentUser returns the current authenticated user
func GetCurrentUser(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Find user
	user, ok := users[userID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Return user data
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user": user.ToResponse(),
	})
}

// GetAllUsers returns all users (admin only)
func GetAllUsers(c *fiber.Ctx) error {
	// Convert users map to slice
	var userList []models.UserResponse
	for _, user := range users {
		userList = append(userList, user.ToResponse())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"users": userList,
	})
}

// GetUserByID returns a user by ID
func GetUserByID(c *fiber.Ctx) error {
	// Get user ID from URL parameter
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Find user
	user, ok := users[userID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Return user data
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user": user.ToResponse(),
	})
}
