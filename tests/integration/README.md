# Integration Tests

This directory contains integration tests for the ProjectFlow application. Integration tests verify that different components of the system work together correctly.

## Test Structure

Each test file focuses on testing a specific handler or service and its interactions with other components:

- `task_handler_test.go`: Tests the task handler's interaction with the task repository
- `project_handler_test.go`: Tests the project handler's interaction with the project repository
- `user_handler_test.go`: Tests the user handler's interaction with the user repository

## Running Tests

To run all integration tests:

```bash
make test-integration
```

To run a specific test file:

```bash
go test -v ./tests/integration/task_handler_test.go
```

## Mocking

We use the `testify/mock` package to create mock implementations of repositories and services. This allows us to test handlers without relying on actual database operations.

## Test Database

For tests that require database interactions, we use an in-memory database to avoid affecting the production database.
