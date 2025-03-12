# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod edit -go=1.21 && \
    go mod edit -require=golang.org/x/crypto@v0.16.0 && \
    go mod edit -require=golang.org/x/sys@v0.15.0 && \
    go mod tidy && \
    go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o projectflow-server .

# Final stage
FROM alpine:3.18

WORKDIR /app

# Install necessary runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Copy the binary from builder
COPY --from=builder /app/projectflow-server .
COPY --from=builder /app/config ./config
COPY --from=builder /app/database/migrations ./database/migrations

# Expose port
EXPOSE 8080

# Command to run
CMD ["./projectflow-server"]
