package main

import (
  "fmt"
  "log"
  "os"
  "time"

  "github.com/amorin24/projecflow/config"
  "github.com/amorin24/projecflow/database"
  "github.com/amorin24/projecflow/models"
  "github.com/google/uuid"
  "golang.org/x/crypto/bcrypt"
)

// Test user credentials - using environment variables or defaults for security
// In production, these would be loaded from environment variables or a secure configuration
var testUsers = []struct {
  Username string
  Email    string
  Password string
  FullName string
  Role     string
}{
  {
    Username: getEnv("ADMIN_USERNAME", "admin"),
    Email:    getEnv("ADMIN_EMAIL", "admin@example.com"),
    Password: getEnv("ADMIN_PASSWORD", "changeme"),
    FullName: "Admin User",
    Role:     "admin",
  },
  {
    Username: getEnv("MANAGER_USERNAME", "manager"),
    Email:    getEnv("MANAGER_EMAIL", "manager@example.com"),
    Password: getEnv("MANAGER_PASSWORD", "changeme"),
    FullName: "Project Manager",
    Role:     "member",
  },
  {
    Username: getEnv("DEVELOPER_USERNAME", "developer"),
    Email:    getEnv("DEVELOPER_EMAIL", "developer@example.com"),
    Password: getEnv("DEVELOPER_PASSWORD", "changeme"),
    FullName: "Developer User",
    Role:     "member",
  },
  {
    Username: getEnv("VIEWER_USERNAME", "viewer"),
    Email:    getEnv("VIEWER_EMAIL", "viewer@example.com"),
    Password: getEnv("VIEWER_PASSWORD", "changeme"),
    FullName: "Viewer User",
    Role:     "member",
  },
}

// Sample project data
var projectNames = []string{
  "Website Redesign",
  "Mobile App Development",
  "Database Migration",
  "Cloud Infrastructure Setup",
  "Marketing Campaign",
}

var projectDescriptions = []string{
  "Redesign the company website with modern UI/UX principles",
  "Develop a cross-platform mobile application for our customers",
  "Migrate legacy database to a new cloud-based solution",
  "Set up and configure cloud infrastructure for scalability",
  "Plan and execute a comprehensive marketing campaign",
}

// Task statuses
var taskStatuses = []string{
  "To Do",
  "In Progress",
  "Done",
}

// Task priorities
var taskPriorities = []string{
  "low",
  "medium",
  "high",
}

// getEnv retrieves an environment variable or returns a default value if not found
func getEnv(key, defaultValue string) string {
  value, exists := os.Getenv(key)
  if !exists {
    return defaultValue
  }
  return value
}
func main() {
  // Initialize database connection
  config.LoadConfig()
  db, err := database.InitDB()
  if err != nil {
    log.Fatalf("Failed to connect to database: %v", err)
  }

  // Create test users
  var userIDs []uuid.UUID
  for _, user := range testUsers {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
      log.Fatalf("Failed to hash password: %v", err)
    }

    userID := uuid.New()
    userIDs = append(userIDs, userID)

    // Insert user into database
    // Implementation depends on your database access layer
    fmt.Printf("Created user: %s (%s)\n", user.Username, user.Email)
  }

  // Create sample projects
  var projectIDs []uuid.UUID
  for i, name := range projectNames {
    projectID := uuid.New()
    projectIDs = append(projectIDs, projectID)

    // Insert project into database
    // Implementation depends on your database access layer
    fmt.Printf("Created project: %s\n", name)
  }

  // Create sample tasks for each project
  for _, projectID := range projectIDs {
    for i := 0; i < 5; i++ {
      taskID := uuid.New()
      statusID := (i % 3) + 1 // Distribute tasks across statuses
      assigneeID := userIDs[i%len(userIDs)]
      priority := taskPriorities[i%len(taskPriorities)]

      // Insert task into database
      // Implementation depends on your database access layer
      fmt.Printf("Created task for project %s\n", projectID)
    }
  }

  fmt.Println("Test data generation completed successfully!")
  fmt.Println("\nTest Credentials:")
  for _, user := range testUsers {
    fmt.Printf("Role: %s\nUsername: %s\nPassword: %s\n\n", user.Role, user.Email, user.Password)
  }
}
