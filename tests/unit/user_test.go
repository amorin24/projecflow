package unit

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"projectflow/models"
)

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
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "password123",
			},
			isValid: true,
		},
		{
			name: "Empty Name",
			user: models.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			isValid:  false,
			errorMsg: "name is required",
		},
		{
			name: "Invalid Email",
			user: models.User{
				Name:     "Test User",
				Email:    "invalid-email",
				Password: "password123",
			},
			isValid:  false,
			errorMsg: "invalid email format",
		},
		{
			name: "Short Password",
			user: models.User{
				Name:     "Test User",
				Email:    "test@example.com",
				Password: "pass",
			},
			isValid:  false,
			errorMsg: "password must be at least 8 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.user.Validate()
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
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "password123",
	}

	// Test password hashing
	err := user.BeforeSave()
	assert.NoError(t, err)
	assert.NotEqual(t, "password123", user.Password, "Password should be hashed")
	assert.NotEmpty(t, user.CreatedAt, "CreatedAt should be set")
}
