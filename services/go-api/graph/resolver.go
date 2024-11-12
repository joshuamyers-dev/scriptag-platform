package graph

import (
	"go-api/core"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	MedicationService core.MedicationService
	UserService       core.UserService
}
