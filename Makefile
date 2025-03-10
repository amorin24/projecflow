.PHONY: test test-unit test-integration test-e2e test-coverage

# Default target
all: test

# Run all tests
test: test-unit test-integration

# Run unit tests
test-unit:
	@echo "Running unit tests..."
	@go test -v ./tests/unit/...

# Run integration tests
test-integration:
	@echo "Running integration tests..."
	@go test -v ./tests/integration/...

# Run e2e tests (requires frontend and backend to be running)
test-e2e:
	@echo "Running e2e tests..."
	@cd tests/e2e && npx cypress run

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -coverprofile=coverage.out ./tests/unit/... ./tests/integration/...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated at coverage.html"

# Setup test environment
setup-test:
	@echo "Setting up test environment..."
	@go get -u github.com/stretchr/testify/assert
	@go get -u github.com/stretchr/testify/mock
	@cd tests/e2e && npm install

# Clean test artifacts
clean-test:
	@echo "Cleaning test artifacts..."
	@rm -f coverage.out coverage.html
