package adapters

import (
	"time"

	"github.com/lib/pq"
)

type MethodType string

const (
	METHOD_TYPE_DAYS        MethodType = "DAYS"
	METHOD_TYPE_INTERVALS   MethodType = "INTERVALS"
	METHOD_TYPE_PERIODS     MethodType = "PERIODS"
	METHOD_TYPE_WHEN_NEEDED MethodType = "WHEN_NEEDED"
)

type RecurringType string

const (
	RECURRING_TYPE_TIME        RecurringType = "TIME"
	RECURRING_TYPE_INTERVALS   RecurringType = "INTERVALS"
	RECURRING_TYPE_PERIODS     RecurringType = "PERIODS"
	RECURRING_TYPE_WHEN_NEEDED RecurringType = "WHEN_NEEDED"
)

type GormUserMedicationSchedule struct {
	Base
	UserMedicationID string             `gorm:"not null;index"`
	UserMedication   GormUserMedication `gorm:"foreignKey:UserMedicationID;constraint:OnDelete:CASCADE"`
	MethodType       MethodType         `gorm:"type:user_medication_method_schedule_type;not null"`
	RecurringType    RecurringType      `gorm:"type:user_medication_recurring_schedule_type;not null"`
	DaysOfWeek       *pq.StringArray    `gorm:"type:varchar(10)[]"`
	TimeSlots        *TimestamptzArray  `gorm:"type:timestamptz[]"`
	StartDate        *time.Time         `gorm:"default:null"`
	EndDate          *time.Time         `gorm:"default:null"`
	DaysInterval     *uint              `gorm:"default:null"`
	HoursInterval    *uint              `gorm:"default:null"`
	UseForDays       *uint              `gorm:"default:null"`
	PauseForDays     *uint              `gorm:"default:null"`
	UseForHours      *uint              `gorm:"default:null"`
	PauseForHours    *uint              `gorm:"default:null"`
	RefillsAmount    *uint              `gorm:"default:null"`
	DosesAmount      *uint              `gorm:"default:null"`
}

func (GormUserMedicationSchedule) TableName() string {
	return "user_medication_schedules"
}
