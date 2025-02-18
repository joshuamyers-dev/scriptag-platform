#!/bin/sh

# Start Cloud SQL Auth Proxy in the background
cloud_sql_proxy -instances=${INSTANCE_CONNECTION_NAME}=tcp:${DB_PORT} &

# Wait for the proxy to start up
sleep 2

# Start the main application
./main
