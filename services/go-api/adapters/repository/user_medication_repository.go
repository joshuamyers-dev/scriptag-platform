package repository

import (
	"go-api/adapters"
	"go-api/core"

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
		ReminderDateTime: userMedication.ReminderDateTime,
		Name:             &userMedication.BrandName,
	}

	if err := r.DB.Create(&gormUserMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	if err := r.DB.Preload("User").Preload("Medication").First(&gormUserMed, "id = ?", gormUserMed.ID).Error; err != nil {
		return &core.UserMedication{}, err
	}

	coreUserMed := core.UserMedication{
		ID: gormUserMed.ID,
		User: core.User{
			ID:    gormUserMed.User.ID,
			Email: gormUserMed.User.Email,
		},
		BrandName:        *gormUserMed.Name,
		ReminderDateTime: gormUserMed.ReminderDateTime,
	}

	if gormUserMed.Medication != nil {
		coreUserMed.ActiveIngredient = gormUserMed.Medication.ActiveIngredient
		coreUserMed.BrandName = gormUserMed.Medication.BrandName
	}

	return &coreUserMed, nil
}

func (r *UserMedicationRepository) CreateSchedule(medicationSchedule *core.MedicationSchedule) (*core.MedicationSchedule, error) {
	panic("not implemented")
}