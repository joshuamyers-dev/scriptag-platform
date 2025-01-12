package config

import (
	"database/sql"
	"fmt"
	adapters "go-api/adapters/models"
	"io"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db *gorm.DB
)

func GetDB() *gorm.DB {
	return db
}

func InitDB() (*gorm.DB, *sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USERNAME")
	// dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s user=%s dbname=%s port=5432 sslmode=disable", dbHost, dbUser, dbName)

	sqlDB, err := sql.Open("pgx", dsn)

	if err != nil {
		return nil, nil, err
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), initConfig())

	if err != nil {
		return nil, nil, err
	}

	createMedicationScheduleTypes(db)

	err = db.AutoMigrate(&adapters.GormUser{},
		&adapters.GormMedication{},
		&adapters.GormUserMedication{},
		&adapters.GormUserFCMToken{},
		&adapters.GormUserMedicationSchedule{},
		&adapters.GormNotificationDelivery{},
	)

	if err != nil {
		log.Panicf("failed to migrate database: %v", err)
	}

	createSearchIndex(db)
	

	if err != nil {
		log.Panicf("Failed to setup workers: %v", err)
	}

	return db, sqlDB, nil
}

func initConfig() *gorm.Config {
	return &gorm.Config{
		Logger:      initLog(),
		PrepareStmt: true,
	}
}

func initLog() logger.Interface {
	f, _ := os.Create("gorm.log")
	newLogger := logger.New(log.New(io.MultiWriter(f, os.Stdout), "\r\n", log.LstdFlags), logger.Config{
		Colorful:             true,
		LogLevel:             logger.Info,
		SlowThreshold:        time.Second,
		ParameterizedQueries: false,
	})
	return newLogger
}

func createSearchIndex(db *gorm.DB) {
	indexSQL := `
        CREATE INDEX IF NOT EXISTS idx_gin_brand_name_active_ingredient
        ON medications
        USING gin (
            to_tsvector('english', "brand_name"),
            to_tsvector('english', "active_ingredient")
        );
    `
	if err := db.Exec(indexSQL).Error; err != nil {
		log.Fatalf("Error creating GIN index: %v", err)
	}
}

func createMedicationScheduleTypes(db *gorm.DB) {
	// sql := `DROP TYPE IF EXISTS user_medication_schedule_type;`

	// if err := db.Exec(sql).Error; err != nil {
	// 	log.Fatalf("Error creating GIN index: %v", err)
	// }

	// sql := `CREATE TYPE user_medication_method_schedule_type AS ENUM (
	// 	'DAYS',
	// 	'INTERVALS',
	// 	'PERIODS',
	// 	'WHEN_NEEDED');
	// 	`

	// if err := db.Exec(sql).Error; err != nil {
	// 	log.Fatalf("Error creating GIN index: %v", err)
	// }

	// sql = `CREATE TYPE user_medication_recurring_schedule_type AS ENUM (
	// 	'TIME',
	// 	'INTERVALS',
	// 	'PERIODS',
	// 	'WHEN_NEEDED');
	// 	`

	// if err := db.Exec(sql).Error; err != nil {
	// 	log.Fatalf("Error creating GIN index: %v", err)
	// }


	// sql := `CREATE TYPE notification_status AS ENUM (
	// 	'PENDING',
	// 	'SENT',
	// 	'FAILED');
	// 	`

	// if err := db.Exec(sql).Error; err != nil {
	// 	log.Fatalf("Error creating GIN index: %v", err)
	// }
}
