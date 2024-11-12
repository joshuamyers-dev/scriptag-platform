package service

import (
	"go-api/core"
	"go-api/graph/model"
)

type MedicationServiceImpl struct {
	repo core.MedicationRepository
}

func NewMedicationService(repo core.MedicationRepository) *MedicationServiceImpl {
	return &MedicationServiceImpl{repo: repo}
}

func (s *MedicationServiceImpl) CreateMedication(med core.Medication) (core.Medication, error) {
	err := s.repo.Create(&med)
	if err != nil {
		return core.Medication{}, err
	}
	return med, nil
}

func (s *MedicationServiceImpl) CreateUserMedication(userMed *core.UserMedication) (*model.MyMedication, error) {
	userMedication, err := s.repo.CreateUserMedication(userMed)

	if err != nil {
		return &model.MyMedication{}, err
	}

	dosageForms := make([]*string, len(userMedication.Medication.DosageForms))
	for i, form := range userMedication.Medication.DosageForms {
		dosageForms[i] = &form
	}

	return &model.MyMedication{
		ID: userMedication.ID,
		User: &model.User{
			ID:    userMedication.User.ID,
			Email: userMedication.User.Email,
		},
		Medication: &model.Medication{
			ID:                 userMedication.Medication.ID,
			BrandName:          userMedication.Medication.BrandName,
			ActiveIngredient:   userMedication.Medication.ActiveIngredient,
			DosageForms:        dosageForms,
			StrengthsAvailable: userMedication.Medication.Strengths,
		},
		ConsumptionTime: userMedication.ReminderDateTime,
	}, nil
}

func (s *MedicationServiceImpl) SearchMedications(query string) (*model.MedicationsConnection, error) {
	coreMeds, err := s.repo.Search(query)
	if err != nil {
		return nil, err
	}

	var medicationEdges []*model.MedicationEdge
	for _, med := range coreMeds.Edges {
		dosageForms := make([]*string, len(med.Node.DosageForms))
		for i, form := range med.Node.DosageForms {
			dosageForms[i] = &form
		}

		medicationEdges = append(medicationEdges, &model.MedicationEdge{
			Cursor: med.Node.ID,
			Node: &model.Medication{
				ID:                 med.Node.ID,
				BrandName:          med.Node.BrandName,
				ActiveIngredient:   med.Node.ActiveIngredient,
				DosageForms:        dosageForms,
				StrengthsAvailable: med.Node.Strengths,
			},
		})
	}

	var medsConnection = &model.MedicationsConnection{
		Edges: medicationEdges,
		PageInfo: &model.PageInfo{
			StartCursor: coreMeds.PageInfo.StartCursor,
			EndCursor:   coreMeds.PageInfo.EndCursor,
			HasNextPage: &coreMeds.PageInfo.HasNextPage,
		},
	}

	return medsConnection, nil
}
