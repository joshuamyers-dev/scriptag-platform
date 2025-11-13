package core

import "github.com/joshnissenbaum/scriptag-platform/services/go-api/graph/model"



type Medication struct {
	ID               string
	ActiveIngredient string
	BrandName        string
	Strength         string
}

type PageInfo struct {
	StartCursor string
	EndCursor   string
	HasNextPage bool
}

type MedicationEdge struct {
	Cursor string
	Node   *Medication
}

type MedicationConnection struct {
	Edges    []*MedicationEdge
	PageInfo PageInfo
}

type MedicationService interface {
	SearchMedications(query string, afterCursor *string) (*model.MedicationsConnection, error)
}

type MedicationRepository interface {
	Search(query string, afterCursor *string) (*MedicationConnection, error)
}
