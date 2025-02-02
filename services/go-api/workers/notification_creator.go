package workers

import (
	"context"
	"go-api/adapters/mappers"
	adapters "go-api/adapters/models"
	"go-api/notifications"
	"log"
	"time"

	"github.com/riverqueue/river"
	"gorm.io/gorm"
)

type NotificationCreatorWorkerArgs struct{}

func (NotificationCreatorWorkerArgs) Kind() string { return "notification_creator" }

type NotificationCreatorWorker struct {
	river.WorkerDefaults[NotificationCreatorWorkerArgs]
	DB *gorm.DB
}

func (w *NotificationCreatorWorker) Work(ctx context.Context, job *river.Job[NotificationCreatorWorkerArgs]) error {
	var results []*adapters.GormUserMedicationSchedule

	today := time.Now().UTC().Format("2006-01-02")
	tomorrow := time.Now().UTC().AddDate(0, 0, 1).Format("2006-01-02")

	_ = w.DB.Joins("LEFT JOIN notification_deliveries AS notifications ON user_medication_schedules.id = notifications.user_medication_schedule_id AND DATE(notifications.notification_date) IN (?, ?)", today, tomorrow).
		Joins("LEFT JOIN user_medication_consumptions AS consumptions ON user_medication_schedules.user_medication_id = consumptions.user_medication_id AND DATE(consumptions.due_date) IN (?, ?)", today, tomorrow).
		Where("notifications.id IS NULL").
		Where("consumptions.id IS NULL").
		Preload("UserMedication").
		FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
			for _, result := range results {
				err := notifications.QueueNotifications(mappers.ToCoreMedicationSchedule(result), w.DB)

				if err != nil {
					log.Printf("Failed to queue notifications for user medication schedule %s\n", result.ID)
				}
			}

			return nil
		})

	return nil
}
