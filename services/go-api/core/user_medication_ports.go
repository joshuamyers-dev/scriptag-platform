package core

import (
	"time"
)

type UserMedication struct {
	ID               string
	UserID           string
	User             User
	MedicationID     *string
	BrandName        string
	ActiveIngredient string
	Strength         string
	ReminderDateTime time.Time
}

type UserMedicationRepository interface {
	Create(userMedication *UserMedication) error
}
