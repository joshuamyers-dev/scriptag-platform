package adapters

import "time"

type GormUserMedication struct {
	Base
	UserID           string          `gorm:"type:uuid"`
	User             GormUser        `gorm:"foreignKey:UserID"`
	MedicationID     *string         `gorm:"type:uuid;index"`
	Medication       *GormMedication `gorm:"foreignKey:MedicationID"`
	Name             *string         `gorm:"type:varchar(255)"`
	Strength         *string         `gorm:"type:varchar(255)"`
	ReminderDateTime time.Time       `gorm:"type:timestamptz"`
}

func (GormUserMedication) TableName() string {
	return "user_medications"
}
