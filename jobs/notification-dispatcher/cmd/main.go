package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	firebase "firebase.google.com/go"
	"github.com/joshnissenbaum/scriptag-platform/jobs/notification-dispatcher/internal/dispatcher"
	"google.golang.org/api/option"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Get database connection string from environment
	connStr := os.Getenv("DB_CONN_STR")

	if connStr == "" {
		log.Fatal("DB_CONN_STR environment variable is required")
	}

	sqlDB, err := sql.Open("pgx", connStr)

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}))

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize Firebase
	ctx := context.Background()
	firebaseApp, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("/app/service-account-key.json"))
	if err != nil {
		log.Fatalf("Failed to initialize Firebase app: %v", err)
	}

	// Create dispatcher
	notificationDispatcher := &dispatcher.NotificationDispatcher{
		DB:          db,
		FirebaseApp: firebaseApp,
	}

	// Process notifications
	log.Println("Starting notification processing...")
	if err := notificationDispatcher.ProcessNotifications(ctx); err != nil {
		log.Fatalf("Error processing notifications: %v", err)
	}
	log.Println("Notification processing completed successfully")
}
