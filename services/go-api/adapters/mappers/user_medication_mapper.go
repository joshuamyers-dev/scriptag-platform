package mappers

import (
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/graph/model"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/utils"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
)

func ToCoreUserMedication(gormUserMed *models.UserMedication) *core.UserMedication {
	var schedule *core.MedicationSchedule

	if gormUserMed.Schedule != nil {
		schedule = ToCoreMedicationSchedule(gormUserMed.Schedule)
	}

	coreUserMed := core.UserMedication{
		ID: gormUserMed.ID,
		User: core.User{
			ID:    gormUserMed.User.ID,
			Email: gormUserMed.User.Email,
		},
		BrandName: *gormUserMed.Name,
		TagLinked: *gormUserMed.TagLinked,
		Strength:  *gormUserMed.Strength,
		Schedule:  schedule,
	}

	if gormUserMed.Medication != nil {
		coreUserMed.ActiveIngredient = gormUserMed.Medication.ActiveIngredient
		coreUserMed.BrandName = gormUserMed.Medication.BrandName
		coreUserMed.Strength = gormUserMed.Medication.Strength
	}

	return &coreUserMed
}

func ToGraphQLMyMedication(coreUserMed *core.UserMedication) *model.MyMedication {
	return &model.MyMedication{
		ID: coreUserMed.ID,
		User: &model.User{
			ID:    coreUserMed.User.ID,
			Email: coreUserMed.User.Email,
		},
		BrandName:        coreUserMed.BrandName,
		ActiveIngredient: &coreUserMed.ActiveIngredient,
		DosageStrength:   coreUserMed.Strength,
		IsTagLinked:      &coreUserMed.TagLinked,
	}
}

func ToGraphQLMyMedicationsConnection(coreConnection *core.UserMedicationConnection) *model.MyMedicationsConnection {
	var edges []*model.MyMedicationEdge

	for _, coreEdge := range coreConnection.Edges {
		edges = append(edges, &model.MyMedicationEdge{
			Cursor: coreEdge.Cursor,
			Node:   ToGraphQLMyMedication(coreEdge.Node),
		})
	}

	return &model.MyMedicationsConnection{
		Edges: edges,
		PageInfo: &model.PageInfo{
			StartCursor: coreConnection.PageInfo.StartCursor,
			EndCursor:   coreConnection.PageInfo.EndCursor,
			HasNextPage: &coreConnection.PageInfo.HasNextPage,
		},
	}
}

func ToCoreMedicationSchedule(gormMedSchedule *models.UserMedicationSchedule) *core.MedicationSchedule {
	var coreTimeSlots []*time.Time

	if gormMedSchedule.TimeSlots != nil {
		for _, t := range *gormMedSchedule.TimeSlots {
			coreTimeSlots = append(coreTimeSlots, t)
		}
	}

	var coreLogHistory []*core.MedicationLogHistory

	return &core.MedicationSchedule{
		ID:               gormMedSchedule.ID,
		UserMedicationID: &gormMedSchedule.UserMedicationID,
		LogHistory:       coreLogHistory,
		MethodType:       gormMedSchedule.MethodType,
		RecurringType:    gormMedSchedule.RecurringType,
		DaysOfWeek:       utils.ConvertStringArrayToPointerArray(gormMedSchedule.DaysOfWeek),
		TimeSlots:        coreTimeSlots,
		StartDate:        gormMedSchedule.StartDate,
		EndDate:          gormMedSchedule.EndDate,
		DaysInterval:     utils.ConvertUintToIntPointer(gormMedSchedule.DaysInterval),
		HoursInterval:    utils.ConvertUintToIntPointer(gormMedSchedule.HoursInterval),
		DosesAmount:      utils.ConvertUintToIntPointer(gormMedSchedule.DosesAmount),
		UseForDays:       utils.ConvertUintToIntPointer(gormMedSchedule.UseForDays),
		UseForHours:      utils.ConvertUintToIntPointer(gormMedSchedule.UseForHours),
		PauseForDays:     utils.ConvertUintToIntPointer(gormMedSchedule.PauseForDays),
		PauseForHours:    utils.ConvertUintToIntPointer(gormMedSchedule.PauseForHours),
	}
}

func ToCoreMedicationLogHistory(gormMedLogHistory *models.UserMedicationConsumption) *core.MedicationLogHistory {
	var userMedication core.UserMedication

	if gormMedLogHistory.UserMedication.ID != "" {
		userMedication = *ToCoreUserMedication(&gormMedLogHistory.UserMedication)
	}

	return &core.MedicationLogHistory{
		ID:               gormMedLogHistory.ID,
		UserMedicationID: gormMedLogHistory.UserMedicationID,
		UserMedication:   userMedication,
		DueTimestamp:     gormMedLogHistory.DueDate,
		ActualTimestamp:  gormMedLogHistory.DoseDate,
		Status:           models.UserMedicationScheduleLogStatus(gormMedLogHistory.Status),
	}
}

func ToGraphQLMedicationLogHistory(coreMedLogHistory *core.MedicationLogHistory) *model.MedicationLogEntry {
	var status model.MedicationLogEntryStatus

	switch coreMedLogHistory.Status {
	case models.LOG_STATUS_MISSED:
		status = model.MedicationLogEntryStatusMissed
	case models.LOG_STATUS_TAKEN:
		status = model.MedicationLogEntryStatusTaken
	case models.LOG_STATUS_UPCOMING:
		status = model.MedicationLogEntryStatusUpcoming
	}

	return &model.MedicationLogEntry{
		ID:           coreMedLogHistory.ID,
		MyMedication: ToGraphQLMyMedication(&coreMedLogHistory.UserMedication),
		DueTime:      coreMedLogHistory.DueTimestamp,
		TakenTime:    coreMedLogHistory.ActualTimestamp,
		Status:       status,
	}
}
