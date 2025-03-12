# Build stage
FROM golang:1.21-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o projectflow

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Copy the binary from the build stage
COPY --from=build /app/projectflow /app/projectflow

# Copy migrations
COPY --from=build /app/database/migrations /app/database/migrations

# Expose the port
EXPOSE 8080

# Set environment variables
ENV DB_HOST=postgres \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_NAME=projectflow \
    SERVER_PORT=8080 \
    JWT_SECRET=your-secret-key \
    ENV=development

# Run the application
CMD ["/app/projectflow"]
