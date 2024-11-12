package core

import "go-api/graph/model"

type Medication struct {
	ID               string
	BrandName        string
	ActiveIngredient string
	DosageForms      []string
	Strengths        []string
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
	SearchMedications(query string) (*model.MedicationsConnection, error)
	CreateUserMedication(userMedication *UserMedication) (*model.MyMedication, error)
}

type MedicationRepository interface {
	FindByID(id string) (Medication, error)
	Create(medication *Medication) error
	CreateUserMedication(userMedication *UserMedication) (*UserMedication, error)
	Search(query string) (*MedicationConnection, error)
}
