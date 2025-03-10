package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/projectflow/utils"
)

// Protected is a middleware that checks if the user is authenticated
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get authorization header
		authHeader := c.Get("Authorization")
		
		// Check if authorization header exists and has the correct format
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		// Extract token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Validate token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Set user ID and role in context for later use
		c.Locals("userID", claims.UserID)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

// AdminOnly is a middleware that checks if the user is an admin
func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get role from context (set by Protected middleware)
		role := c.Locals("role")

		// Check if user is admin
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin access required",
			})
		}

		return c.Next()
	}
}
