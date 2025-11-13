package models

import (
	"time"
)

type NotificationStatus string

const (
	NOTIFICATION_STATUS_PENDING NotificationStatus = "PENDING"
	NOTIFICATION_STATUS_SENT    NotificationStatus = "SENT"
	NOTIFICATION_STATUS_FAILED  NotificationStatus = "FAILED"
)

type NotificationDelivery struct {
	Base
	UserMedicationScheduleID string                    `gorm:"not null;index"`
	UserMedicationSchedule   UserMedicationSchedule    `gorm:"foreignKey:UserMedicationScheduleID;constraint:OnDelete:CASCADE"`
	NotificationDate         time.Time                 `gorm:"not null"`
	Status                   NotificationStatus        `gorm:"type:notification_status;not null"`
}

func (NotificationDelivery) TableName() string {
	return "notification_deliveries"
}
