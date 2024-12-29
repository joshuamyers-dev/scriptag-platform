package adapters

import (
	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
)

type GormUserMedication struct {
	Base
	UserID           string          `gorm:"type:uuid"`
	User             GormUser        `gorm:"foreignKey:UserID"`
	MedicationID     *string         `gorm:"type:uuid;index"`
	Medication       *GormMedication `gorm:"foreignKey:MedicationID"`
	Name             *string         `gorm:"type:varchar(255)"`
	Strength         *string         `gorm:"type:varchar(255)"`
	TagLinked		 *bool           `gorm:"type:boolean;default:false"`
}


func CreateUserMedicationPaginator(
	cursor paginator.Cursor,
	order *paginator.Order,
	limit *int,
) *paginator.Paginator {
	p := paginator.New(
		&paginator.Config{
			Keys:          []string{"UserID", "ID"},
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

func (GormUserMedication) TableName() string {
	return "user_medications"
}
