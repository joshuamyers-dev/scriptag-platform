# Use a lightweight base image
FROM golang:1.24 AS builder

WORKDIR /app

# Copy the project files
COPY jobs/notification-dispatcher/ ./jobs/notification-dispatcher/
COPY shared/ ./shared/
COPY jobs/notification-dispatcher/service-account-key.json /app/service-account-key.json

# Create a minimal go.work file
RUN echo "go 1.24" > go.work && \
    echo "use (" >> go.work && \
    echo "    ./jobs/notification-dispatcher" >> go.work && \
    echo "    ./shared" >> go.work && \
    echo ")" >> go.work

WORKDIR /app/jobs/notification-dispatcher

# Update module dependencies
RUN go mod edit -replace github.com/joshnissenbaum/scriptag-platform/shared=../../shared && \
    go mod edit -dropreplace github.com/joshnissenbaum/scriptag-platform/libs/models

# Download and verify all dependencies
RUN go mod download && \
    go mod tidy && \
    go mod verify

# Build the notification-dispatcher binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /notification-dispatcher ./cmd/main.go

# Final lightweight image
FROM alpine:latest AS runner

# Install necessary dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    jq

# Create a directory for the application
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /notification-dispatcher /notification-dispatcher

# Copy the service account key from the builder stage
COPY --from=builder /app/service-account-key.json /app/service-account-key.json

# Create directory for the Cloud SQL Auth Proxy unix socket
RUN mkdir -p /cloudsql

# Copy startup script
COPY jobs/notification-dispatcher/start.sh .
RUN chmod +x start.sh

# Command to run the notification dispatcher
CMD ["./start.sh"]
