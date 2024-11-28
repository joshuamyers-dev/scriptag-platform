package core

import "go-api/graph/model"

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
	CreateMedication(medication Medication) (Medication, error)
	SearchMedications(query string, afterCursor *string) (*model.MedicationsConnection, error)
	CreateUserMedication(userMedication *UserMedication) (*model.MyMedication, error)
}

type MedicationRepository interface {
	FindByID(id string) (Medication, error)
	Create(medication *Medication) error
	CreateUserMedication(userMedication *UserMedication) (*UserMedication, error)
	Search(query string, afterCursor *string) (*MedicationConnection, error)
}
