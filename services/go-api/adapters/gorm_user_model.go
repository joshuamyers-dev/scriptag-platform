package adapters

import (
	"time"

	"gorm.io/gorm"
)

type Base struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type GormUser struct {
	Base
	Email    string `gorm:"uniqueIndex"`
	Password string
}

func (GormUser) TableName() string {
	return "users"
}
