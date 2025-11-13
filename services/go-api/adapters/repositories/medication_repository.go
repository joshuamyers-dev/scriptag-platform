package repository

import (
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"

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
	var medications []*models.Medication
	
	statement := r.DB.Model(&models.Medication{}).
		Select(`*, 
			(ts_rank(brand_name_tsv, websearch_to_tsquery('english', ?)) + 
			ts_rank(active_ingredient_tsv, websearch_to_tsquery('english', ?))) * 0.7 + 
			(similarity(brand_name, ?) + similarity(active_ingredient, ?)) * 0.3 as rank`, 
			query, query, query, query).
		Where(`
			brand_name_tsv @@ websearch_to_tsquery('english', ?) OR
			active_ingredient_tsv @@ websearch_to_tsquery('english', ?) OR
			similarity(brand_name, ?) > 0.3 OR
			similarity(active_ingredient, ?) > 0.3
		`, query, query, query, query).
		Order("rank DESC")

	limit := 10
	paginator := models.CreateMedicationPaginator(paginator.Cursor{
		After: afterCursor,
	}, nil, &limit)

	_, cursor, err := paginator.Paginate(statement, &medications)

	if err != nil {
		return nil, err
	}

	var coreMeds []*core.MedicationEdge

	for _, med := range medications {
		coreMeds = append(coreMeds, &core.MedicationEdge{
			Cursor: med.ID,
			Node: &core.Medication{
				ID:               med.ID,
				ActiveIngredient: med.ActiveIngredient,
				BrandName:        med.BrandName,
				Strength:         med.Strength,
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