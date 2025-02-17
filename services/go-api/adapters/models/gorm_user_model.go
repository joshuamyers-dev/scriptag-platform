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
	Email     string              `gorm:"unique;type:varchar(255)"`
	Password  string              `gorm:"type:varchar(255)"`
	FCMTokens []*GormUserFCMToken `gorm:"foreignKey:UserID"`
	TimeZone  string              `gorm:"type:varchar(255)"`
}

func (GormUser) TableName() string {
	return "users"
}
