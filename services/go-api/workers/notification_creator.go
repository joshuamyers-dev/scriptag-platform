package workers

import (
	"context"
	"log"
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/adapters/mappers"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/notifications"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
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
	var results []*models.UserMedicationSchedule

	today := time.Now().UTC().Format("2006-01-02")
	nextMonth := time.Now().UTC().AddDate(0, 1, 0).Format("2006-01-02")

	_ = w.DB.Joins("LEFT JOIN notification_deliveries AS notifications ON user_medication_schedules.id = notifications.user_medication_schedule_id AND DATE(notifications.notification_date) BETWEEN ? AND ?", today, nextMonth).
		Joins("LEFT JOIN user_medication_consumptions AS consumptions ON user_medication_schedules.user_medication_id = consumptions.user_medication_id AND DATE(consumptions.due_date) BETWEEN ? AND ?", today, nextMonth).
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
