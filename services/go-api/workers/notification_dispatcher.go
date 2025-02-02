package workers

import (
	"context"
	adapters "go-api/adapters/models"
	"go-api/notifications"
	"log"
	"time"

	firebase "firebase.google.com/go"
	"github.com/riverqueue/river"
	"gorm.io/gorm"
)

type MedicationScheduleWorkerArgs struct{}

func (MedicationScheduleWorkerArgs) Kind() string { return "medication_schedule_worker" }

type MedicationScheduleWorker struct {
	river.WorkerDefaults[MedicationScheduleWorkerArgs]
	DB          *gorm.DB
	firebaseApp *firebase.App
}

func (w *MedicationScheduleWorker) Work(ctx context.Context, job *river.Job[MedicationScheduleWorkerArgs]) error {
	var results []*adapters.GormNotificationDelivery
	var now = time.Now().UTC()
	fcmClient, err := w.firebaseApp.Messaging(ctx)

	if err != nil {
		log.Fatalf("Failed to create Firebase Messaging client: %v\n", err)
	}

	_ = w.DB.
		Where("DATE_TRUNC('minute', notification_date::timestamp) = DATE_TRUNC('minute', ?::timestamp)", now).
		Preload("UserMedicationSchedule.UserMedication.User.FCMTokens").
		Preload("UserMedicationSchedule.UserMedication.Medication").
		FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
			for _, result := range results {
				log.Printf("Sending notification for user medication schedule %s\n", result.UserMedicationScheduleID)

				for _, token := range result.UserMedicationSchedule.UserMedication.User.FCMTokens {
					notifications.SendFCMMessage(
						fcmClient,
						ctx,
						w.DB,
						token.Token,
						"Medication Reminder",
						"It's time to take your "+
							adapters.BrandNameIngredientName(result.UserMedicationSchedule.UserMedication.Medication)+". Tap your NFC tag before taking your medication.")

				}
			}

			return nil
		})

	return nil
}
