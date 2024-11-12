package adapters

import (
	"github.com/lib/pq"
	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
)

type GormMedication struct {
	Base
	BrandName            string         `gorm:"type:text"`
	ActiveIngredientName string         `gorm:"type:text"`
	DosageForms          pq.StringArray `gorm:"type:text[]"`
	Strengths            pq.StringArray `gorm:"type:text[]"`
}

func CreateMedicationPaginator(
	cursor paginator.Cursor,
	order *paginator.Order,
	limit *int,
) *paginator.Paginator {
	p := paginator.New(
		&paginator.Config{
			Keys:  []string{"ID", "CreatedAt"},
			Limit: 10,
			Order: paginator.ASC,
		},
	)
	if order != nil {
		p.SetOrder(*order)
	}
	if limit != nil {
		p.SetLimit(*limit)
	}
	if cursor.After != nil {
		p.SetAfterCursor(*cursor.After)
	}
	if cursor.Before != nil {
		p.SetBeforeCursor(*cursor.Before)
	}
	return p
}

func (GormMedication) TableName() string {
	return "medications"
}
