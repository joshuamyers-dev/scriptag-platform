package models

type UserFCMToken struct {
	Base
	Token  string `gorm:"type:varchar(255)"`
	UserID string `gorm:"type:uuid"`
	User   User   `gorm:"foreignKey:UserID"`
}

func (UserFCMToken) TableName() string {
	return "user_fcm_tokens"
}
