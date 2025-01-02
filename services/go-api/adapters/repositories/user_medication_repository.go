package repository

import (
	"go-api/adapters/mappers"
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/utils"

	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
	"gorm.io/gorm"
)

type UserMedicationRepository struct {
	DB *gorm.DB
}

func NewUserMedicationRepository(db *gorm.DB) *UserMedicationRepository {
	return &UserMedicationRepository{DB: db}
}

func (r *UserMedicationRepository) Create(userMedication *core.UserMedication) (*core.UserMedication, error) {
	gormUserMed := adapters.GormUserMedication{
		UserID:           userMedication.UserID,
		MedicationID:     userMedication.MedicationID,
		Strength:         &userMedication.Strength,
		Name:             &userMedication.BrandName,
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
		timeSlots = append(timeSlots, t)
	}

	gormMedSchedule := adapters.GormUserMedicationSchedule{
		UserMedicationID: *medicationSchedule.UserMedicationID,
		MethodType:       adapters.MethodType(medicationSchedule.MethodType),
		RecurringType:    adapters.RecurringType(medicationSchedule.RecurringType),
		DaysOfWeek:       utils.ConvertStringPointerArray(medicationSchedule.DaysOfWeek),
		TimeSlots:        &timeSlots,
		StartDate:        medicationSchedule.StartDate,
		EndDate:          medicationSchedule.EndDate,
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

	if err := r.DB.Save(&gormUserMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	return mappers.ToCoreUserMedication(&gormUserMed), nil
}

func (r *UserMedicationRepository) UpdateSchedule(medicationSchedule *core.MedicationSchedule) (*core.MedicationSchedule, error) {
	var gormSchedule adapters.GormUserMedicationSchedule

	if err := r.DB.First(&gormSchedule, "id = ?", medicationSchedule.ID).Error; err != nil {
		return &core.MedicationSchedule{}, err
	}

	gormSchedule.DosesAmount = utils.ConvertUintPointer(medicationSchedule.DosesAmount)

	if err := r.DB.Save(&gormSchedule).Error; err != nil {
		return &core.MedicationSchedule{}, err
	}

	return mappers.ToCoreMedicationSchedule(&gormSchedule), nil
}