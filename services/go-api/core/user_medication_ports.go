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
	Schedule         *MedicationSchedule
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
	LogHistory       []*MedicationLogHistory
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

type MedicationLogHistory struct {
	ID               string
	UserMedicationID string
	UserMedication   UserMedication
	DueTimestamp     time.Time
	ActualTimestamp  *time.Time
	Status           adapters.UserMedicationScheduleLogStatus
}

type UserMedicationRepository interface {
	Create(userMedication *UserMedication) (*UserMedication, error)
	CreateSchedule(userMedicationSchedule *MedicationSchedule) (*MedicationSchedule, error)
	FetchScheduleByUserMedicationID(id string) (*MedicationSchedule, error)
	FetchUserMedicationByID(id string) (*UserMedication, error)
	FetchUserMedicationWithSchedule(id string) (*UserMedication, error)
	FetchPaginated(userId string, afterCursor *string) (*UserMedicationConnection, error)
	UpdateUserMedication(userMedication *UserMedication) (*UserMedication, error)
	FetchLogHistoryByUserID(userId string, timestamp time.Time) ([]*MedicationLogHistory, error)
	UpdateMedicationOnTagScan(userMedicationId string, timestamp time.Time) error
}

type UserMedicationService interface {
	CreateUserMedication(userMedication *UserMedication) (*model.MyMedication, error)
	CreateUserMedicationSchedule(userMedicationSchedule *MedicationSchedule, userId string, db *gorm.DB) (bool, error)
	FetchUserMedications(userId string, afterCursor *string) (*model.MyMedicationsConnection, error)
	FetchLogHistory(userId string, timestamp time.Time) ([]*model.MedicationLogEntry, error)
	UpdateUserMedicationTagLinked(userId string, userMedicationId string, tagLinked bool) (bool, error)
	OnTagScanned(userId string, medicationId string) (bool, error)
}
