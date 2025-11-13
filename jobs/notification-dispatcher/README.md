# Notification Dispatcher

A Cloud Run service that handles medication reminder notifications using Firebase Cloud Messaging.

## Setup

1. Set the following environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `PORT`: (Optional) HTTP port to listen on (defaults to 8080)

2. Place your Firebase credentials in `firebase-credentials.json` at the root of the project.

## Development

```bash
go mod download
go run cmd/main.go
```

## Deployment

Deploy to Cloud Run using:

```bash
gcloud run deploy notification-dispatcher \
  --source . \
  --region [REGION] \
  --set-env-vars "DATABASE_URL=[YOUR_DATABASE_URL]"
```

## Architecture

The service:
1. Runs as a Cloud Run function triggered by Cloud Scheduler
2. Uses GORM for database interactions
3. Sends notifications via Firebase Cloud Messaging
4. Processes notifications in batches of 100
5. Automatically removes invalid FCM tokens
