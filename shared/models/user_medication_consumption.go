package models

import "time"

type UserMedicationScheduleLogStatus string

const (
	LOG_STATUS_UPCOMING UserMedicationScheduleLogStatus = "UPCOMING"
	LOG_STATUS_TAKEN    UserMedicationScheduleLogStatus = "TAKEN"
	LOG_STATUS_MISSED   UserMedicationScheduleLogStatus = "MISSED"
)

type UserMedicationConsumption struct {
	Base
	UserMedicationID string                          `gorm:"not null;index"`
	UserMedication   UserMedication                  `gorm:"foreignKey:UserMedicationID;constraint:OnDelete:CASCADE"`
	DueDate          time.Time                       `gorm:""`
	DoseDate         *time.Time                      `gorm:"default:null"`
	Status           UserMedicationScheduleLogStatus `gorm:"type:user_medication_schedule_log_status;default:UPCOMING"`
}

func (UserMedicationConsumption) TableName() string {
	return "user_medication_consumptions"
}
