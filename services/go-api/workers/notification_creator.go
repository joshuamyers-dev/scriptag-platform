package workers

import (
	"context"
	"go-api/adapters/mappers"
	adapters "go-api/adapters/models"
	"go-api/notifications"
	"log"

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

	_ = w.DB.FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
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
