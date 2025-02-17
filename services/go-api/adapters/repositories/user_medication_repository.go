package repository

import (
	"errors"
	"fmt"
	"go-api/adapters/mappers"
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/utils"
	"time"

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
	gormUserMed := adapters.GormUserMedication{
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
	var timeSlots adapters.TimeArray
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

	gormMedSchedule := adapters.GormUserMedicationSchedule{
		UserMedicationID: *medicationSchedule.UserMedicationID,
		MethodType:       adapters.MethodType(medicationSchedule.MethodType),
		RecurringType:    adapters.RecurringType(medicationSchedule.RecurringType),
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
	var userMed adapters.GormUserMedication

	if err := r.DB.First(&userMed, "id = ?", id).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&userMed), nil
}

func (r *UserMedicationRepository) FetchUserMedicationWithSchedule(id string) (*core.UserMedication, error) {
	var userMed adapters.GormUserMedication

	if err := r.DB.Preload("Schedule").First(&userMed, "id = ?", id).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&userMed), nil
}

func (r *UserMedicationRepository) FetchScheduleByUserMedicationID(id string) (*core.MedicationSchedule, error) {
	var gormMedSchedule adapters.GormUserMedicationSchedule

	if err := r.DB.First(&gormMedSchedule, "user_medication_id = ?", id).Error; err != nil {
		return &core.MedicationSchedule{}, err
	}

	return mappers.ToCoreMedicationSchedule(&gormMedSchedule), nil
}

func (r *UserMedicationRepository) FetchPaginated(userId string, afterCursor *string) (*core.UserMedicationConnection, error) {
	var userMeds []*adapters.GormUserMedication
	statement := r.DB.Model(&adapters.GormUserMedication{}).
		Where("user_id = ?", userId).
		Order("created_at DESC").
		Preload("Medication")

	limit := 10
	paginator := adapters.CreateUserMedicationPaginator(paginator.Cursor{
		After: afterCursor,
	}, nil, &limit)

	_, cursor, err := paginator.Paginate(statement, &userMeds)

	if err != nil {
		return nil, err
	}

	var coreUserMeds []*core.UserMedicationEdge

	for _, gormUserMed := range userMeds {
		coreUserMed := mappers.ToCoreUserMedication(gormUserMed)
		coreUserMeds = append(coreUserMeds, &core.UserMedicationEdge{
			Cursor: gormUserMed.ID,
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
	var gormUserMed adapters.GormUserMedication

	if err := r.DB.First(&gormUserMed, "id = ?", userMedication.ID).Error; err != nil {
		return &core.UserMedication{}, err
	}

	gormUserMed.TagLinked = &userMedication.TagLinked

	if err := r.DB.Updates(&gormUserMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&gormUserMed), nil
}

func (r *UserMedicationRepository) FetchLogHistoryByUserID(userId string, timestamp time.Time) ([]*core.MedicationLogHistory, error) {
	var logs []*adapters.GormUserMedicationConsumption

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

	var coreLogs []*core.MedicationLogHistory

	for _, log := range logs {
		coreLogs = append(coreLogs, mappers.ToCoreMedicationLogHistory(log))
	}

	return coreLogs, nil
}

func (r *UserMedicationRepository) UpdateMedicationOnTagScan(userMedicationId string, timestamp time.Time) error {
	userMed, err := r.FetchUserMedicationWithSchedule(userMedicationId)

	if err != nil {
		return err
	}

	err = r.DB.Transaction(func(tx *gorm.DB) error {
		if *userMed.Schedule.DosesAmount > 0 {
			*userMed.Schedule.DosesAmount--
		} else {
			return errors.New("no doses remaining")
		}

		if err := tx.Model(&adapters.GormUserMedicationSchedule{}).
			Where("id = ?", userMed.Schedule.ID).
			Updates(&adapters.GormUserMedicationSchedule{DosesAmount: utils.ConvertUintPointer(userMed.Schedule.DosesAmount)}).
			Error; err != nil {
			return err
		}

		topClosestSubquery := tx.Model(&adapters.GormNotificationDelivery{}).
			Select("id").
			Where("user_medication_schedule_id = ?", userMed.Schedule.ID).
			Order(fmt.Sprintf("ABS(EXTRACT(EPOCH FROM (notification_date - '%s'))) ASC", timestamp.Format("2006-01-02 15:04:05"))).
			Limit(1)

		if err := tx.Where("id = (?)", topClosestSubquery).
			Delete(&adapters.GormNotificationDelivery{}).
			Error; err != nil {
			return err
		}

		timeNow := time.Now().UTC()

		topClosestSubquery = tx.Model(&adapters.GormUserMedicationConsumption{}).
			Select("id").
			Where("user_medication_id = ?", userMedicationId).
			Order(fmt.Sprintf("ABS(EXTRACT(EPOCH FROM (due_date - '%s'))) ASC", timestamp.Format("2006-01-02 15:04:05"))).
			Limit(1)

		if err := tx.Model(&adapters.GormUserMedicationConsumption{}).
			Where("id = (?)", topClosestSubquery).
			Updates(&adapters.GormUserMedicationConsumption{DoseDate: &timeNow, Status: adapters.LOG_STATUS_TAKEN}).
			Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}
