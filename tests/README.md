# ProjectFlow Test Suite

This directory contains the test suite for the ProjectFlow application, organized into three main categories:

## Unit Tests

Located in the `unit/` directory, these tests focus on testing individual components and functions in isolation. They verify that each unit of code works as expected without dependencies on external systems.

### Running Unit Tests

```bash
make test-unit
```

## Integration Tests

Located in the `integration/` directory, these tests verify that different components of the system work together correctly. They test the interaction between multiple units and may involve database operations.

### Running Integration Tests

```bash
make test-integration
```

## End-to-End Tests

Located in the `e2e/` directory, these tests simulate real user scenarios and test the entire application stack from the frontend to the backend. They use Cypress to automate browser interactions.

### Running E2E Tests

```bash
make test-e2e
```

Note: E2E tests require both the frontend and backend servers to be running.

## Test Coverage

To generate a test coverage report:

```bash
make test-coverage
```

This will create a `coverage.html` file that you can open in your browser to see which parts of the code are covered by tests.

## Test Structure

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Test complete user flows from the frontend to the backend

## Mocking

For unit and integration tests that require external dependencies, we use mocks to simulate these dependencies. This allows us to test components in isolation without relying on external systems.

## Continuous Integration

All tests are run automatically on each pull request and must pass before merging.
