package mappers

import (
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/graph/model"
	"go-api/utils"
	"time"
)

func ToCoreUserMedication(gormUserMed *adapters.GormUserMedication) *core.UserMedication {
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

func ToCoreMedicationSchedule(gormMedSchedule *adapters.GormUserMedicationSchedule) *core.MedicationSchedule {
	var coreTimeSlots []*time.Time

	if gormMedSchedule.TimeSlots != nil {
		for _, t := range *gormMedSchedule.TimeSlots {
			coreTimeSlots = append(coreTimeSlots, t)
		}
	}

	return &core.MedicationSchedule{
		ID:               gormMedSchedule.ID,
		UserMedicationID: &gormMedSchedule.UserMedicationID,
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
