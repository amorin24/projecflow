package unit

import (
	"errors"
	"testing"
	"time"

	"github.com/amorin24/projecflow/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func validateUser(user models.User) error {
	if user.Username == "" {
		return errors.New("username is required")
	}
	if user.Email == "" {
		return errors.New("email is required")
	}
	if user.Email != "" && !isValidEmail(user.Email) {
		return errors.New("invalid email format")
	}
	if user.PasswordHash == "" {
		return errors.New("password is required")
	}
	if len(user.PasswordHash) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}

func isValidEmail(email string) bool {
	return len(email) > 3 && (email[len(email)-4:] == ".com" || email[len(email)-3:] == ".io")
}

func beforeSaveUser(user *models.User) error {
	now := time.Now()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	user.UpdatedAt = now
	
	// Simulate password hashing
	if user.PasswordHash != "" && len(user.PasswordHash) < 60 {
		user.PasswordHash = "hashed_" + user.PasswordHash
	}
	
	return nil
}

func TestUserValidation(t *testing.T) {
	tests := []struct {
		name     string
		user     models.User
		isValid  bool
		errorMsg string
	}{
		{
			name: "Valid User",
			user: models.User{
				ID:           uuid.New(),
				Username:     "testuser",
				Email:        "test@example.com",
				PasswordHash: "password123",
				FullName:     "Test User",
				Role:         "member",
			},
			isValid: true,
		},
		{
			name: "Empty Username",
			user: models.User{
				Email:        "test@example.com",
				PasswordHash: "password123",
				FullName:     "Test User",
				Role:         "member",
			},
			isValid:  false,
			errorMsg: "username is required",
		},
		{
			name: "Invalid Email",
			user: models.User{
				Username:     "testuser",
				Email:        "invalid-email",
				PasswordHash: "password123",
				FullName:     "Test User",
				Role:         "member",
			},
			isValid:  false,
			errorMsg: "invalid email format",
		},
		{
			name: "Short Password",
			user: models.User{
				Username:     "testuser",
				Email:        "test@example.com",
				PasswordHash: "pass",
				FullName:     "Test User",
				Role:         "member",
			},
			isValid:  false,
			errorMsg: "password must be at least 8 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateUser(tt.user)
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

func TestUserBeforeSave(t *testing.T) {
	user := models.User{
		ID:           uuid.New(),
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: "password123",
		FullName:     "Test User",
		Role:         "member",
	}

	// Test password hashing using our mock function
	err := beforeSaveUser(&user)
	assert.NoError(t, err)
	assert.NotEqual(t, "password123", user.PasswordHash, "Password should be hashed")
	assert.NotEmpty(t, user.CreatedAt, "CreatedAt should be set")
}
