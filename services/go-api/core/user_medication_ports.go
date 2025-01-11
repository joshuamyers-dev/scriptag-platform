package core

import (
	adapters "go-api/adapters/models"
	"go-api/graph/model"
	"time"

	"gorm.io/gorm"
)

type UserMedication struct {
	ID               string
	UserID           string
	User             User
	MedicationID     *string
	BrandName        string
	ActiveIngredient string
	Strength         string
	TagLinked        bool
	Schedule 	     *MedicationSchedule
}

type UserMedicationEdge struct {
	Cursor string
	Node   *UserMedication
}

type UserMedicationConnection struct {
	Edges    []*UserMedicationEdge
	PageInfo PageInfo
}

type MedicationSchedule struct {
	ID               string
	UserMedicationID *string
	MedicationID     *string
	MethodType       adapters.MethodType
	RecurringType    adapters.RecurringType
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

type MyMedicationSchedule struct {
	DosageIntervalHours *int
	DosageIntervalDays  *int
	AmountRemaining     *int
}

type UserMedicationRepository interface {
	Create(userMedication *UserMedication) (*UserMedication, error)
	CreateSchedule(userMedicationSchedule *MedicationSchedule) (*MedicationSchedule, error)
	UpdateSchedule(userMedicationSchedule *MedicationSchedule) (*MedicationSchedule, error)
	FetchScheduleByUserMedicationID(id string) (*MedicationSchedule, error)
	FetchUserMedicationByID(id string) (*UserMedication, error)
	FetchPaginated(userId string, afterCursor *string) (*UserMedicationConnection, error)
	UpdateUserMedication(userMedication *UserMedication) (*UserMedication, error)
}

type UserMedicationService interface {
	CreateUserMedication(userMedication *UserMedication) (*model.MyMedication, error)
	CreateUserMedicationSchedule(userMedicationSchedule *MedicationSchedule, userId string, db *gorm.DB) (bool, error)
	FetchUserMedications(userId string, afterCursor *string) (*model.MyMedicationsConnection, error)
	UpdateUserMedicationTagLinked(userId string, userMedicationId string, tagLinked bool) (bool, error)
	OnTagScanned(userId string, medicationId string) (bool, error)
}
