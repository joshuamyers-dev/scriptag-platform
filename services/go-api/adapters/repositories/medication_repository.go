package repository

import (
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/utils"

	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
	"gorm.io/gorm"
)

type MedicationRepository struct {
	DB *gorm.DB
}

func NewMedicationRepository(db *gorm.DB) *MedicationRepository {
	return &MedicationRepository{DB: db}
}

func (r *MedicationRepository) Search(query string, afterCursor *string) (*core.MedicationConnection, error) {
	tsQuery := utils.ConvertToTSQuery(query)

	var medications []*adapters.GormMedication
	statement := r.DB.Model(&adapters.GormMedication{}).
		Where("to_tsvector('english', brand_name) @@ to_tsquery('english', ?)", tsQuery).
		Or("to_tsvector('english', active_ingredient) @@ to_tsquery('english', ?)", tsQuery)

	limit := 10
	paginator := adapters.CreateMedicationPaginator(paginator.Cursor{
		After: afterCursor,
	}, nil, &limit)

	_, cursor, err := paginator.Paginate(statement, &medications)

	if err != nil {
		return nil, err
	}

	var coreMeds []*core.MedicationEdge

	for _, gormMed := range medications {
		coreMeds = append(coreMeds, &core.MedicationEdge{
			Cursor: gormMed.ID,
			Node: &core.Medication{
				ID:               gormMed.ID,
				ActiveIngredient: gormMed.ActiveIngredient,
				BrandName:        gormMed.BrandName,
				Strength:         gormMed.Strength,
			},
		})
	}

	var startCursor, endCursor string

	if cursor.Before != nil {
		startCursor = *cursor.Before
	}
	if cursor.After != nil {
		endCursor = *cursor.After
	}

	var medConnection = &core.MedicationConnection{
		Edges: coreMeds,
		PageInfo: core.PageInfo{
			StartCursor: startCursor,
			EndCursor:   endCursor,
			HasNextPage: cursor.After != nil,
		},
	}

	return medConnection, nil
}
