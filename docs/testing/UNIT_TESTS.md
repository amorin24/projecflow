# Unit Tests

This directory contains unit tests for the ProjectFlow application. Unit tests focus on testing individual components and functions in isolation.

## Test Structure

Each test file corresponds to a specific model or utility:

- `user_test.go`: Tests the User model's validation and lifecycle methods
- `project_test.go`: Tests the Project model's validation and lifecycle methods
- `task_test.go`: Tests the Task model's validation and lifecycle methods
- `jwt_test.go`: Tests JWT token generation and validation

## Running Tests

To run all unit tests:

```bash
make test-unit
```

To run a specific test file:

```bash
go test -v ./tests/unit/user_test.go
```

## Test Coverage

To generate a test coverage report:

```bash
make test-coverage
```

## Best Practices

- Each test should be independent and not rely on the state from other tests
- Use descriptive test names that explain what is being tested
- Use table-driven tests for testing multiple scenarios
- Use assertions from the `testify/assert` package for clearer test failures
