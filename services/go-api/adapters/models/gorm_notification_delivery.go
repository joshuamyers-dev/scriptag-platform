package adapters

import (
	"time"
)

type NotificationStatus string

const (
	NOTIFICATION_STATUS_PENDING NotificationStatus = "PENDING"
	NOTIFICATION_STATUS_SENT    NotificationStatus = "SENT"
	NOTIFICATION_STATUS_FAILED  NotificationStatus = "FAILED"
)

type GormNotificationDelivery struct {
	Base
	UserMedicationScheduleID string                          `gorm:"not null;index"`
	UserMedicationSchedule   GormUserMedicationSchedule      `gorm:"foreignKey:UserMedicationScheduleID;constraint:OnDelete:CASCADE"`
	NotificationDate         time.Time                       `gorm:"not null"`
	Status                   NotificationStatus              `gorm:"type:notification_status;not null"`
}

func (GormNotificationDelivery) TableName() string {
	return "notification_deliveries"
}
