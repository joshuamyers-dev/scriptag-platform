package core

import (
	"go-api/graph/model"
	"time"
)

type UserMedication struct {
	ID               string
	UserID           string
	User             User
	MedicationID     *string
	BrandName        string
	ActiveIngredient string
	Strength         string
	ReminderDateTime time.Time
}

type MedicationSchedule struct {
	ID               string
	UserMedicationID string
	MethodType       model.MethodScheduleType
	RecurringType    model.RecurringScheduleType
	DaysOfWeek       []*string
	TimeSlots        []*time.Time
	StartDate        *time.Time
	EndDate          *time.Time
	DaysInterval     *int
	HoursInterval    *int
	UseForDays       *int
	PauseForDays     *int
	UseForHours      *int
	PauseForHours    *int
	RefillsAmount    *int
	DosesAmount      *int
}

type UserMedicationRepository interface {
	Create(userMedication *UserMedication) (*UserMedication, error)
	CreateSchedule(userMedicationSchedule *MedicationSchedule) (*MedicationSchedule, error)
}

type UserMedicationService interface {
	CreateUserMedication(userMedication *UserMedication) (*model.MyMedication, error)
	CreateUserMedicationSchedule(userMedicationSchedule *MedicationSchedule) (bool, error)
}
