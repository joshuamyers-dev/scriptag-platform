# Stage 1: Build the Go application
FROM golang:1.24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY services/go-api/go.mod services/go-api/go.sum ./

# Create a minimal go.work file
RUN echo "go 1.24" > go.work && \
    echo "use (" >> go.work && \
    echo "    ." >> go.work && \
    echo "    ../shared" >> go.work && \
    echo ")" >> go.work

# Add replace directive for shared module
RUN go mod edit -replace github.com/joshnissenbaum/scriptag-platform/shared=../shared

# Copy the rest of the application code
COPY services/go-api/ ./
COPY shared/ ../shared/

# Download Go module dependencies
RUN go mod download && \
    go mod tidy && \
    go mod verify

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o main server.go

# Stage 2: Minimal image for running the app
FROM alpine:latest AS runner

# Install necessary dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    jq 

RUN curl -sSf https://atlasgo.sh | sh

# Create a directory for the application
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy migrations directory from the host
COPY services/go-api/migrations /app/migrations

# Create directory for the Cloud SQL Auth Proxy unix socket
RUN mkdir -p /cloudsql

# Copy startup script
COPY services/go-api/start.sh .
RUN chmod +x start.sh

# Expose the port on which the application runs
EXPOSE 8080

# Start the application using the startup script
CMD ["./start.sh"]