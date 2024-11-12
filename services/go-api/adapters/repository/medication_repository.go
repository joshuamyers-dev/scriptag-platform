package repository

import (
	"go-api/adapters"
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

// FindByID implements core.TodoRepository.
func (r *MedicationRepository) FindByID(id string) (core.Medication, error) {
	panic("unimplemented")
}

func (r *MedicationRepository) Create(todo *core.Medication) error {
	// gormTodo := adapters.GormMedication{
	// 	Text:   todo.Text,
	// 	Done:   todo.Done,
	// 	UserID: todo.UserId,
	// }
	// if err := r.DB.Create(&gormTodo).Error; err != nil {
	// 	return err
	// }
	// todo.ID = gormTodo.ID
	return nil
}

func (r *MedicationRepository) CreateUserMedication(userMedication *core.UserMedication) (*core.UserMedication, error) {
	gormUserMed := adapters.GormUserMedication{
		UserID:           userMedication.UserID,
		MedicationID:     userMedication.MedicationID,
		Strength:         userMedication.Strength,
		ReminderDateTime: userMedication.ReminderDateTime,
	}

	if err := r.DB.Create(&gormUserMed).Error; err != nil {
		return &core.UserMedication{}, err
	}

	if err := r.DB.Preload("User").Preload("Medication").First(&gormUserMed, "id = ?", gormUserMed.ID).Error; err != nil {
		return &core.UserMedication{}, err
	}

	coreUserMed := core.UserMedication{
		ID: gormUserMed.ID,
		User: core.User{
			ID:    gormUserMed.User.ID,
			Email: gormUserMed.User.Email,
		},
		Medication: core.Medication{
			ID:               gormUserMed.Medication.ID,
			BrandName:        gormUserMed.Medication.BrandName,
			ActiveIngredient: gormUserMed.Medication.ActiveIngredientName,
			DosageForms:      gormUserMed.Medication.DosageForms,
			Strengths:        gormUserMed.Medication.Strengths,
		},
		Strength:         gormUserMed.Strength,
		ReminderDateTime: gormUserMed.ReminderDateTime,
	}

	return &coreUserMed, nil
}

func (r *MedicationRepository) Search(query string) (*core.MedicationConnection, error) {
	tsQuery := utils.ConvertToTSQuery(query)

	var medications []*adapters.GormMedication
	statement := r.DB.Model(&adapters.GormMedication{}).
		Where("to_tsvector('english', brand_name) @@ to_tsquery('english', ?)", tsQuery).
		Or("to_tsvector('english', active_ingredient_name) @@ to_tsquery('english', ?)", tsQuery)

	limit := 10
	paginator := adapters.CreateMedicationPaginator(paginator.Cursor{}, nil, &limit)

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
				BrandName:        gormMed.BrandName,
				ActiveIngredient: gormMed.ActiveIngredientName,
				DosageForms:      gormMed.DosageForms,
				Strengths:        gormMed.Strengths,
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
