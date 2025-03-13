# Build stage
FROM golang:1.21-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download all dependencies explicitly with compatible versions
RUN go mod download && \
    go mod tidy && \
    go mod verify

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o projectflow-server main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Copy the binary from the build stage
COPY --from=build /app/projectflow-server /app/projectflow-server

# Copy migrations
COPY --from=build /app/database/migrations /app/database/migrations

# Create a proper entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'echo "Waiting for PostgreSQL to start..."' >> /app/entrypoint.sh && \
    echo 'while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do' >> /app/entrypoint.sh && \
    echo '  sleep 1' >> /app/entrypoint.sh && \
    echo 'done' >> /app/entrypoint.sh && \
    echo 'echo "PostgreSQL started, running migrations..."' >> /app/entrypoint.sh && \
    echo '/app/projectflow-server' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

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
    ENV=development \
    ALLOWED_ORIGINS=http://localhost,http://frontend

# Run the application using the entrypoint script
CMD ["/app/entrypoint.sh"]
