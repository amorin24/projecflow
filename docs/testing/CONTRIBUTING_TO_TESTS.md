# Contributing to ProjectFlow Tests

This guide provides detailed instructions for contributing to the ProjectFlow test suite.

## Test Structure Overview

The ProjectFlow test suite is organized into three main categories:

1. **Unit Tests** (`/tests/unit/`): Test individual components in isolation
2. **Integration Tests** (`/tests/integration/`): Test interactions between components
3. **End-to-End Tests** (`/tests/e2e/`): Test complete user flows

## Setting Up the Test Environment

Before running or writing tests, set up your environment:

```bash
# Install dependencies
npm install

# Set up test environment
make setup-test
```

## Writing Unit Tests

### Frontend Unit Tests (React/TypeScript)

Frontend unit tests use Vitest and React Testing Library. Tests should be placed in `src/components/__tests__/` or `src/pages/__tests__/` directories.

Example component test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('handles user interaction', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Backend Unit Tests (Go)

Backend unit tests use Go's testing package with testify assertions. Tests should be placed in the `/tests/unit/` directory.

Example Go test:

```go
package unit

import (
	"testing"
	
	"github.com/amorin24/projecflow/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestSomeFunctionality(t *testing.T) {
	// Setup
	id := uuid.New()
	testData := models.SomeModel{
		ID: id,
		Name: "Test Name",
	}
	
	// Test
	result := SomeFunction(testData)
	
	// Assert
	assert.Equal(t, expected, result)
}
```

## Writing Integration Tests

Integration tests verify that different components work together correctly. These tests should be placed in the `/tests/integration/` directory.

Example integration test:

```go
package integration

import (
	"testing"
	"net/http/httptest"
	
	"github.com/amorin24/projecflow/api/handlers"
	"github.com/amorin24/projecflow/models"
	"github.com/stretchr/testify/assert"
)

func TestAPIEndpoint(t *testing.T) {
	// Setup server
	router := setupTestRouter()
	server := httptest.NewServer(router)
	defer server.Close()
	
	// Make request
	resp, err := http.Get(server.URL + "/api/endpoint")
	
	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
}
```

## Writing End-to-End Tests

E2E tests use Cypress to test the entire application stack. These tests should be placed in the `/tests/e2e/cypress/e2e/` directory.

Example Cypress test:

```javascript
describe('User Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Setup test data or login if needed
    cy.login('testuser', 'password');
  });

  it('should create a new task', () => {
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title"]').type('New Test Task');
    cy.get('[data-testid="task-description"]').type('This is a test task');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="task-list"]').should('contain', 'New Test Task');
  });
});
```

## Mocking

### Frontend Mocking

Use Vitest's mocking capabilities for external dependencies:

```typescript
import { vi } from 'vitest';
import * as api from '../api';

// Mock the API module
vi.mock('../api', () => ({
  getTask: vi.fn(),
  createTask: vi.fn(),
}));

// Setup mock implementation
vi.mocked(api.getTask).mockResolvedValue({
  data: { task: mockTaskData },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});
```

### Backend Mocking

Use testify/mock for Go mocking:

```go
import (
	"testing"
	
	"github.com/amorin24/projecflow/database"
	"github.com/stretchr/testify/mock"
)

// Create a mock database
type MockDB struct {
	mock.Mock
}

func (m *MockDB) GetUser(id string) (*models.User, error) {
	args := m.Called(id)
	return args.Get(0).(*models.User), args.Error(1)
}

func TestWithMockDB(t *testing.T) {
	mockDB := new(MockDB)
	mockDB.On("GetUser", "123").Return(&models.User{ID: "123", Name: "Test User"}, nil)
	
	// Use the mock in your test
	service := NewService(mockDB)
	result, err := service.DoSomethingWithUser("123")
	
	// Assert
	assert.NoError(t, err)
	mockDB.AssertExpectations(t)
}
```

## Best Practices

1. **Test Independence**: Each test should be independent and not rely on the state from other tests.

2. **Descriptive Names**: Use descriptive test names that explain what is being tested.

3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases.

4. **Test Edge Cases**: Include tests for edge cases and error conditions.

5. **Avoid Test Duplication**: Use test helpers and fixtures to avoid duplicating code.

6. **Keep Tests Fast**: Tests should run quickly to encourage frequent testing.

7. **Test Real Behavior**: Focus on testing behavior rather than implementation details.

8. **Maintain Test Coverage**: Aim for at least 80% test coverage for critical code paths.

## Running Tests

```bash
# Run all tests
make test

# Run unit tests only
make test-unit

# Run integration tests only
make test-integration

# Run e2e tests (requires frontend and backend to be running)
make test-e2e

# Generate test coverage report
make test-coverage
```

## Troubleshooting Common Issues

### Frontend Test Issues

1. **Component Rendering Problems**: Ensure you're wrapping components with necessary providers (Router, Context, etc.).

2. **Async Test Failures**: Use `waitFor` or `findBy` queries for asynchronous operations.

3. **Mock Issues**: Verify that mocks are properly set up and cleared between tests.

### Backend Test Issues

1. **Database Connection Errors**: Use mock databases for unit tests to avoid external dependencies.

2. **UUID Type Errors**: Ensure you're using proper UUID types from the uuid package.

3. **Import Path Issues**: Verify that import paths use the full module path (`github.com/amorin24/projecflow/...`).

## Continuous Integration

All tests are run automatically on each pull request and must pass before merging. The CI pipeline includes:

1. Linting
2. Unit tests
3. Integration tests
4. E2E tests (when applicable)
5. Test coverage reporting

## Getting Help

If you encounter issues with the test suite, please:

1. Check the troubleshooting section above
2. Review existing test files for examples
3. Reach out to the development team for assistance
