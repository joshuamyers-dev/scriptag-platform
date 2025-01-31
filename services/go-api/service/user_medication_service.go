package service

import (
	"go-api/adapters/mappers"
	"go-api/core"
	"go-api/graph/model"
	"go-api/notifications"
	"time"

	"gorm.io/gorm"
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

func (s *UserMedicationServiceImpl) CreateUserMedicationSchedule(medicationSchedule *core.MedicationSchedule, userId string, db *gorm.DB) (bool, error) {
	var userMed *core.UserMedication
	var err error

	if medicationSchedule.MedicationID != nil {
		userMed, err = s.repo.Create(&core.UserMedication{
			UserID:       userId,
			MedicationID: medicationSchedule.MedicationID,
		})

		if err != nil {
			return false, err
		}
	} else {
		userMed, err = s.repo.FetchUserMedicationByID(*medicationSchedule.UserMedicationID)

		if err != nil {
			return false, err
		}
	}

	schedule, err := s.repo.CreateSchedule(&core.MedicationSchedule{
		UserMedicationID: &userMed.ID,
		MedicationID:     userMed.MedicationID,
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

	err = notifications.QueueNotifications(schedule, db)

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

func (s *UserMedicationServiceImpl) FetchLogHistory(userId string, timestamp time.Time) ([]*model.MedicationLogEntry, error) {
	logHistory, err := s.repo.FetchLogHistoryByUserID(userId, timestamp)

	if err != nil {
		return nil, err
	}

	var entries []*model.MedicationLogEntry

	for _, log := range logHistory {
		entries = append(entries, mappers.ToGraphQLMedicationLogHistory(log))
	}

	return entries, nil
}

func (s *UserMedicationServiceImpl) UpdateUserMedicationTagLinked(userId string, userMedicationId string, tagLinked bool) (bool, error) {
	userMed, err := s.repo.FetchUserMedicationByID(userMedicationId)

	if err != nil {
		return false, err
	}

	userMed.TagLinked = tagLinked

	_, err = s.repo.UpdateUserMedication(userMed)

	if err != nil {
		return false, err
	}

	return true, nil
}

func (s *UserMedicationServiceImpl) OnTagScanned(userId string, medicationId string) (bool, error) {
	err := s.repo.UpdateMedicationOnTagScan(medicationId, time.Now().UTC())

	if err != nil {
		return false, err
	}

	return true, nil
}
