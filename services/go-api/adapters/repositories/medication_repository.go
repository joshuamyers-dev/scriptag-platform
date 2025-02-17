package repository

import (
	adapters "go-api/adapters/models"
	"go-api/core"

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
	var medications []*adapters.GormMedication
	
	statement := r.DB.Model(&adapters.GormMedication{}).
		Select(`*, 
			(ts_rank(to_tsvector('english', brand_name), websearch_to_tsquery('english', ?)) + 
			ts_rank(to_tsvector('english', active_ingredient), websearch_to_tsquery('english', ?))) * 0.7 + 
			(similarity(brand_name, ?) + similarity(active_ingredient, ?)) * 0.3 as rank`, 
			query, query, query, query).
		Where(`
			to_tsvector('english', brand_name) @@ websearch_to_tsquery('english', ?) OR
			to_tsvector('english', active_ingredient) @@ websearch_to_tsquery('english', ?) OR
			similarity(brand_name, ?) > 0.3 OR
			similarity(active_ingredient, ?) > 0.3
		`, query, query, query, query).
		Order("rank DESC")

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