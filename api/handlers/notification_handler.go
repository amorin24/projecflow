package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/projectflow/models"
)

// In-memory storage for development
var notifications = make(map[uuid.UUID]*models.Notification)

// GetUserNotifications returns all notifications for the current user
func GetUserNotifications(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get all notifications for the user
	var notificationList []*models.Notification
	for _, notification := range notifications {
		if notification.UserID == userID {
			notificationList = append(notificationList, notification)
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"notifications": notificationList,
	})
}

// MarkNotificationRead marks a notification as read
func MarkNotificationRead(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get notification ID from URL parameter
	id := c.Params("id")
	notificationID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	// Find notification
	notification, ok := notifications[notificationID]
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	// Check if notification belongs to the user
	if notification.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have access to this notification",
		})
	}

	// Parse request body
	var req models.MarkNotificationReadRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update notification
	notification.Read = req.Read

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"notification": notification,
	})
}

// MarkAllNotificationsRead marks all notifications for the current user as read
func MarkAllNotificationsRead(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Update all notifications for the user
	for _, notification := range notifications {
		if notification.UserID == userID {
			notification.Read = true
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "All notifications marked as read",
	})
}
