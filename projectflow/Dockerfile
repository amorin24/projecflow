# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy all source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o projectflow-server .

# Final stage
FROM alpine:3.18

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/projectflow-server .
COPY --from=builder /app/config ./config
COPY --from=builder /app/database/migrations ./database/migrations

# Expose port
EXPOSE 8080

# Command to run
CMD ["./projectflow-server"]
