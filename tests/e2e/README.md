# End-to-End Tests

This directory contains end-to-end tests for the ProjectFlow application. E2E tests simulate real user scenarios and test the entire application stack from the frontend to the backend.

## Test Structure

The tests are organized by feature:

- `task_management.cy.js`: Tests task creation, editing, and deletion
- `project_management.cy.js`: Tests project creation, editing, and deletion
- `user_management.cy.js`: Tests user registration, login, and profile management
- `date_handling.cy.js`: Tests date input handling and validation

## Running Tests

To run all E2E tests:

```bash
make test-e2e
```

To open the Cypress test runner:

```bash
cd tests/e2e && npx cypress open
```

## Prerequisites

Before running E2E tests, make sure:

1. The backend server is running on http://localhost:8080
2. The frontend server is running on http://localhost:5173
3. The test database is set up and accessible

## Test Data

The E2E tests create their own test data during execution. Each test should clean up after itself to ensure a clean state for subsequent tests.

## Best Practices

- Use descriptive test names that explain the user scenario being tested
- Use page objects to encapsulate page interactions
- Use data attributes for selecting elements to make tests more resilient to UI changes
- Avoid depending on the state from other tests
