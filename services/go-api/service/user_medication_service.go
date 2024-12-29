package service

import (
	"go-api/adapters/mappers"
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

	return mappers.ToGraphQLMyMedication(userMedication), nil
}

func (s *UserMedicationServiceImpl) CreateUserMedicationSchedule(medicationSchedule *core.MedicationSchedule, userId string) (bool, error) {
	userMed, err := s.repo.Create(&core.UserMedication{
		UserID:       userId,
		MedicationID: &medicationSchedule.UserMedicationID,
	})

	if err != nil {
		return false, err
	}

	_, err = s.repo.CreateSchedule(&core.MedicationSchedule{
		UserMedicationID: userMed.ID,
		MethodType:       medicationSchedule.MethodType,
		RecurringType:    medicationSchedule.RecurringType,
		DaysOfWeek:       medicationSchedule.DaysOfWeek,
		TimeSlots:        medicationSchedule.TimeSlots,
		StartDate:        medicationSchedule.StartDate,
		EndDate:          medicationSchedule.EndDate,
		DaysInterval:     medicationSchedule.DaysInterval,
		HoursInterval:    medicationSchedule.HoursInterval,
		UseForDays:       medicationSchedule.UseForDays,
		PauseForDays:     medicationSchedule.PauseForDays,
		UseForHours:      medicationSchedule.UseForHours,
		PauseForHours:    medicationSchedule.PauseForHours,
		RefillsAmount:    medicationSchedule.RefillsAmount,
		DosesAmount:      medicationSchedule.DosesAmount,
	})

	if err != nil {
		return false, err
	}

	return true, nil
}

func (s *UserMedicationServiceImpl) FetchUserMedications(userId string, afterCursor *string) (*model.MyMedicationsConnection, error) {
	userMeds, err := s.repo.FetchPaginated(userId, afterCursor)

	if err != nil {
		return nil, err
	}

	var myMeds *model.MyMedicationsConnection
	var edges []*model.MyMedicationEdge

	for _, userMed := range userMeds.Edges {
		edges = append(edges, &model.MyMedicationEdge{
			Cursor: userMed.Cursor,
			Node:   mappers.ToGraphQLMyMedication(userMed.Node),
		})
	}

	myMeds = &model.MyMedicationsConnection{
		Edges: edges,
		PageInfo: &model.PageInfo{
			HasNextPage: &userMeds.PageInfo.HasNextPage,
			EndCursor:   userMeds.PageInfo.EndCursor,
		},
	}

	return myMeds, nil
}
