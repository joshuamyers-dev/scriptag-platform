package service

import (
	"go-api/core"
	"go-api/graph/model"
)

type UserMedicationServiceImpl struct {
	repo core.UserMedicationRepository
}

func NewUserMedicationService(repo core.UserMedicationRepository) *UserMedicationServiceImpl {
	return &UserMedicationServiceImpl{repo: repo}
}

func (s *UserMedicationServiceImpl) CreateUserMedication(userMed *core.UserMedication) (*model.MyMedication, error) {
	userMedication, err := s.repo.Create(userMed)

	if err != nil {
		return &model.MyMedication{}, err
	}

	return &model.MyMedication{
		ID: userMedication.ID,
		User: &model.User{
			ID:    userMedication.User.ID,
			Email: userMedication.User.Email,
		},
		BrandName: userMed.BrandName,
		ActiveIngredient: &userMed.ActiveIngredient,
		DosageStrength: userMed.Strength,
		ConsumptionTime: userMedication.ReminderDateTime,
	}, nil
}

func (s *UserMedicationServiceImpl) CreateUserMedicationSchedule(medicationSchedule *core.MedicationSchedule) (bool, error) {
	panic("not implemented")
}