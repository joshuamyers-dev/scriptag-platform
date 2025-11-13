package models

import (
	"github.com/pilagod/gorm-cursor-paginator/v2/paginator"
)

type UserMedication struct {
	Base
	UserID       string                 `gorm:"type:uuid"`
	User         User                   `gorm:"foreignKey:UserID"`
	MedicationID *string                `gorm:"type:uuid;index"`
	Medication   *Medication            `gorm:"foreignKey:MedicationID"`
	Schedule     *UserMedicationSchedule `gorm:"foreignKey:UserMedicationID"`
	Name         *string                `gorm:"type:varchar(255)"`
	Strength     *string                `gorm:"type:varchar(255)"`
	TagLinked    *bool                  `gorm:"type:boolean;default:false"`
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

func BrandNameIngredientName(med *Medication) string {
    if med.ActiveIngredient == "" {
        return med.BrandName
    } else {
        return med.BrandName + " " + med.ActiveIngredient
    }
}

func (UserMedication) TableName() string {
	return "user_medications"
}
