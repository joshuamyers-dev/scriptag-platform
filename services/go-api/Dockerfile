# Stage 1: Build the Go application
FROM golang:1.23-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files
COPY go.mod go.sum ./

# Download Go module dependencies
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o main server.go

# Stage 2: Minimal image for running the app
FROM alpine:latest as runner

# Install necessary dependencies
RUN apk add --no-cache \
    ca-certificates \
    wget \
    && wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /usr/local/bin/cloud_sql_proxy \
    && chmod +x /usr/local/bin/cloud_sql_proxy

# Create a directory for the application
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .  

# Create directory for the Cloud SQL Auth Proxy unix socket
RUN mkdir -p /cloudsql

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Expose the port on which the application runs
EXPOSE 8080

# Start the application using the startup script
CMD ["./start.sh"]