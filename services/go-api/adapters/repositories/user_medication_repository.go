package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/adapters/mappers"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/utils"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"

	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
	"gorm.io/gorm"
)

type UserMedicationRepository struct {
	DB       *gorm.DB
	UserRepo core.UserRepository
}

func NewUserMedicationRepository(db *gorm.DB, userRepo core.UserRepository) *UserMedicationRepository {
	return &UserMedicationRepository{DB: db, UserRepo: userRepo}
}

func (r *UserMedicationRepository) Create(userMedication *core.UserMedication) (*core.UserMedication, error) {
	gormUserMed := models.UserMedication{
		UserID:       userMedication.UserID,
		MedicationID: userMedication.MedicationID,
		Strength:     &userMedication.Strength,
		Name:         &userMedication.BrandName,
	}

	if err := r.DB.Create(&gormUserMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	if err := r.DB.Preload("User").Preload("Medication").First(&gormUserMed, "id = ?", gormUserMed.ID).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&gormUserMed), nil
}

func (r *UserMedicationRepository) CreateSchedule(medicationSchedule *core.MedicationSchedule) (*core.MedicationSchedule, error) {
	var timeSlots models.TimeArray
	for _, t := range medicationSchedule.TimeSlots {
		slot := t.UTC()
		timeSlots = append(timeSlots, &slot)
	}

	startDate := medicationSchedule.StartDate.UTC()

	var endDate *time.Time

	if medicationSchedule.EndDate != nil {
		utcEndDate := medicationSchedule.EndDate.UTC()
		endDate = &utcEndDate
	}

	gormMedSchedule := models.UserMedicationSchedule{
		UserMedicationID: *medicationSchedule.UserMedicationID,
		MethodType:       models.MethodType(medicationSchedule.MethodType),
		RecurringType:    models.RecurringType(medicationSchedule.RecurringType),
		DaysOfWeek:       utils.ConvertStringPointerArray(medicationSchedule.DaysOfWeek),
		TimeSlots:        &timeSlots,
		StartDate:        &startDate,
		EndDate:          endDate,
		DaysInterval:     utils.ConvertUintPointer(medicationSchedule.DaysInterval),
		HoursInterval:    utils.ConvertUintPointer(medicationSchedule.HoursInterval),
		DosesAmount:      utils.ConvertUintPointer(medicationSchedule.DosesAmount),
		PauseForDays:     utils.ConvertUintPointer(medicationSchedule.PauseForDays),
		UseForDays:       utils.ConvertUintPointer(medicationSchedule.UseForDays),
		PauseForHours:    utils.ConvertUintPointer(medicationSchedule.PauseForHours),
		UseForHours:      utils.ConvertUintPointer(medicationSchedule.UseForHours),
	}

	if err := r.DB.Create(&gormMedSchedule).Error; err != nil {
		return &core.MedicationSchedule{}, err
	}

	return mappers.ToCoreMedicationSchedule(&gormMedSchedule), nil
}

func (r *UserMedicationRepository) FetchUserMedicationByID(id string) (*core.UserMedication, error) {
	var userMed models.UserMedication

	if err := r.DB.First(&userMed, "id = ?", id).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&userMed), nil
}

func (r *UserMedicationRepository) FetchUserMedicationWithSchedule(id string) (*core.UserMedication, error) {
	var userMed models.UserMedication

	if err := r.DB.Preload("Schedule").First(&userMed, "id = ?", id).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&userMed), nil
}

func (r *UserMedicationRepository) FetchScheduleByUserMedicationID(id string) (*core.MedicationSchedule, error) {
	var medSchedule models.UserMedicationSchedule

	if err := r.DB.First(&medSchedule, "user_medication_id = ?", id).Error; err != nil {
		return &core.MedicationSchedule{}, err
	}

	return mappers.ToCoreMedicationSchedule(&medSchedule), nil
}

func (r *UserMedicationRepository) FetchPaginated(userId string, afterCursor *string) (*core.UserMedicationConnection, error) {
	var userMeds []*models.UserMedication
	statement := r.DB.Model(&models.UserMedication{}).
		Where("user_id = ?", userId).
		Order("created_at DESC").
		Preload("Medication")

	limit := 10
	paginator := models.CreateUserMedicationPaginator(paginator.Cursor{
		After: afterCursor,
	}, nil, &limit)

	_, cursor, err := paginator.Paginate(statement, &userMeds)

	if err != nil {
		return nil, err
	}

	var coreUserMeds []*core.UserMedicationEdge

	for _, userMed := range userMeds {
		coreUserMed := mappers.ToCoreUserMedication(userMed)
		coreUserMeds = append(coreUserMeds, &core.UserMedicationEdge{
			Cursor: userMed.ID,
			Node:   coreUserMed,
		})
	}

	var startCursor, endCursor string

	if cursor.Before != nil {
		startCursor = *cursor.Before
	}
	if cursor.After != nil {
		endCursor = *cursor.After
	}

	var userMedConnection = &core.UserMedicationConnection{
		Edges: coreUserMeds,
		PageInfo: core.PageInfo{
			StartCursor: startCursor,
			EndCursor:   endCursor,
			HasNextPage: cursor.After != nil,
		},
	}

	return userMedConnection, nil
}

func (r *UserMedicationRepository) UpdateUserMedication(userMedication *core.UserMedication) (*core.UserMedication, error) {
	var userMed models.UserMedication

	if err := r.DB.First(&userMed, "id = ?", userMedication.ID).Error; err != nil {
		return &core.UserMedication{}, err
	}

	userMed.TagLinked = &userMedication.TagLinked

	if err := r.DB.Updates(&userMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&userMed), nil
}

func (r *UserMedicationRepository) FetchLogHistoryByUserID(userId string, timestamp time.Time) ([]*core.MedicationLogHistory, error) {
	var logs []*models.UserMedicationConsumption

	user, err := r.UserRepo.FindByID(userId)

	if err != nil {
		return nil, err
	}

	timezone, _ := time.LoadLocation(user.TimeZone)
	startOfDayLocal := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day(), 0, 0, 0, 0, timezone)
	endOfDayLocal := startOfDayLocal.Add(24 * time.Hour)
	startOfDayUTC := startOfDayLocal.UTC()
	endOfDayUTC := endOfDayLocal.UTC()

	if err := r.DB.Joins("JOIN user_medications ON user_medications.id = user_medication_consumptions.user_medication_id").
		Where("user_medications.user_id = ?", userId).
		Where("due_date >= ? AND due_date < ?", startOfDayUTC, endOfDayUTC).
		Preload("UserMedication.Medication").
		Order("due_date ASC").
		Find(&logs).Error; err != nil {
		return nil, err
	}

	var logHistories []*core.MedicationLogHistory

	for _, log := range logs {
		logHistories = append(logHistories, mappers.ToCoreMedicationLogHistory(log))
	}

	return logHistories, nil
}

func (r *UserMedicationRepository) UpdateMedicationOnTagScan(userMedicationId string, timestamp time.Time) error {
	var userMed models.UserMedication

	if err := r.DB.Preload("Schedule").First(&userMed, "id = ?", userMedicationId).Error; err != nil {
		return err
	}

	if !*userMed.TagLinked {
		return errors.New("medication is not linked to a tag")
	}

	if userMed.Schedule == nil {
		return errors.New("medication has no schedule")
	}

	var log models.UserMedicationConsumption

	if err := r.DB.Where("user_medication_id = ?", userMedicationId).
		Where("status = ?", models.LOG_STATUS_UPCOMING).
		Order("due_date ASC").
		First(&log).Error; err != nil {
		return err
	}

	if log.DoseDate != nil {
		return errors.New("medication has already been taken")
	}

	if timestamp.Before(log.DueDate.Add(-time.Hour)) {
		return fmt.Errorf("medication is not due yet. due at %v", log.DueDate)
	}

	log.DoseDate = &timestamp
	log.Status = models.LOG_STATUS_TAKEN

	if err := r.DB.Save(&log).Error; err != nil {
		return err
	}

	return nil
}
