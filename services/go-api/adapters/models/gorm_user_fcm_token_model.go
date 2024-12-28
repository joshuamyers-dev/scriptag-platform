package adapters

type GormUserFCMToken struct {
	Base
	Token  string   `gorm:"type:varchar(255)"`
	UserID string   `gorm:"type:uuid"`
	User   GormUser `gorm:"foreignKey:UserID"`
}

func (GormUserFCMToken) TableName() string {
	return "user_fcm_tokens"
}
