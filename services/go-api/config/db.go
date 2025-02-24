package config

import (
	"database/sql"
	"io"
	"log"
	"os"
	"time"

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
	connStr := os.Getenv("DB_CONN_STR")
	sqlDB, err := sql.Open("pgx", connStr)

	if err != nil {
		return nil, nil, err
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), initConfig())

	if err != nil {
		return nil, nil, err
	}

	return db, sqlDB, nil
}

func initConfig() *gorm.Config {
	return &gorm.Config{
		Logger:      initLog(),
		PrepareStmt: true,
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
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
