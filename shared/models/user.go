package models

type User struct {
	Base
	Email     string       `gorm:"unique;type:varchar(255)"`
	Password  string       `gorm:"type:varchar(255)"`
	FCMTokens []UserFCMToken `gorm:"foreignKey:UserID"`
	TimeZone  string       `gorm:"type:varchar(255)"`
}

func (User) TableName() string {
	return "users"
}
