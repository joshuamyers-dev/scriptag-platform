package graph

import (
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	GormDB                *gorm.DB
	MedicationService     core.MedicationService
	UserService           core.UserService
	UserMedicationService core.UserMedicationService
}
