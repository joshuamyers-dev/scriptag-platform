#!/bin/sh

# Start Cloud SQL Auth Proxy in the background
echo "Downloading Cloud SQL Proxy..."
SQL_PROXY_DIR="/tmp"
mkdir -p "$SQL_PROXY_DIR"
SQL_PROXY="$SQL_PROXY_DIR/cloud-sql-proxy"

if ! curl -s -o "$SQL_PROXY" https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64; then
  echo "ERROR: Failed to download Cloud SQL Proxy"
fi

chmod +x "$SQL_PROXY"

"$SQL_PROXY" "${INSTANCE_CONNECTION_NAME}" --port ${DB_PORT} --private-ip &

# Wait for the proxy to start up
sleep 2

# Check migrations directory path from Dockerfile
MIGRATIONS_DIR="/app/migrations"

# URL for database connection (using URL-encoded password)
# First, escape any special characters in the password
ENCODED_PASS=$(printf "%s" "$DB_PASSWORD" | jq -s -R -r @uri)
DB_URL="postgres://${DB_USERNAME}:${ENCODED_PASS}@localhost:${DB_PORT}/${DB_NAME}?sslmode=disable"

# First, explicitly rehash the migrations to fix checksum errors
echo "Re-hashing migrations to fix checksum errors"
atlas migrate hash --dir "file://$MIGRATIONS_DIR"

# Apply all migrations
echo "Applying all migrations to the database:"
atlas migrate apply --dir "file://$MIGRATIONS_DIR" --url "$DB_URL"

echo "Starting the main application"
./main
