#!/bin/sh
set -e  # Exit immediately if a command exits with a non-zero status

# Debug information
echo "--------- DEBUGGING INFO ---------"
echo "Starting script in directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "User: $(whoami)"
echo "Environment variables:"
env | grep -E 'INSTANCE|DB'
echo "--------------------------------"

# Start Cloud SQL Auth Proxy in the background
echo "Downloading Cloud SQL Proxy..."
SQL_PROXY_DIR="/tmp"
mkdir -p "$SQL_PROXY_DIR"
SQL_PROXY="$SQL_PROXY_DIR/cloud-sql-proxy"

if ! curl -s -o "$SQL_PROXY" https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64; then
  echo "ERROR: Failed to download Cloud SQL Proxy"
  exit 1
fi

echo "Making Cloud SQL Proxy executable"
chmod +x "$SQL_PROXY" || {
  echo "ERROR: Failed to make Cloud SQL Proxy executable"
  exit 1
}

echo "Cloud SQL Proxy file details:"
ls -la "$SQL_PROXY"

echo "Starting Cloud SQL Proxy"
"$SQL_PROXY" "${INSTANCE_CONNECTION_NAME}" --port ${DB_PORT} --private-ip &
PROXY_PID=$!
echo "Cloud SQL Proxy started with PID: $PROXY_PID"

# Wait for the proxy to start up
sleep 5

# Verify the proxy is running
if ! kill -0 $PROXY_PID 2>/dev/null; then
  echo "ERROR: Cloud SQL Proxy failed to start or crashed"
  exit 1
fi


echo "Running notification dispatcher"
exec /notification-dispatcher
