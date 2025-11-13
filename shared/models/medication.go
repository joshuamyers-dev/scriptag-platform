package models

import (
	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
)

type Medication struct {
	Base
	BrandName        string `gorm:"type:text"`
	ActiveIngredient string `gorm:"type:text"`
	Strength         string `gorm:"type:varchar(255)"`
}

func CreateMedicationPaginator(
	cursor paginator.Cursor,
	order *paginator.Order,
	limit *int,
) *paginator.Paginator {
	p := paginator.New(
		&paginator.Config{
			Keys:          []string{"CreatedAt", "ID"},
			Order:         paginator.ASC,
			AllowTupleCmp: paginator.TRUE,
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

func (Medication) TableName() string {
	return "medications"
}
