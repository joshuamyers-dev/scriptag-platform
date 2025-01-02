package config

import (
	"context"
	"database/sql"
	adapters "go-api/adapters/models"
	"log"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/messaging"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverdatabasesql"
	"gorm.io/gorm"
)

type MedicationScheduleWorkerArgs struct{}

func (MedicationScheduleWorkerArgs) Kind() string { return "medication_schedule_worker" }

type MedicationScheduleWorker struct {
	river.WorkerDefaults[MedicationScheduleWorkerArgs]
	DB *gorm.DB
	firebaseApp *firebase.App
}

func (w *MedicationScheduleWorker) Work(ctx context.Context, job *river.Job[MedicationScheduleWorkerArgs]) error {
	var results []*adapters.GormUserMedication
	var now = time.Now()
	fcmClient, err := w.firebaseApp.Messaging(ctx)

	if err != nil {
		log.Fatalf("Failed to create Firebase Messaging client: %v\n", err)
	}

	_ = w.DB.Preload("Schedule", w.DB.Where("? >= start_date", now)).
		Preload("User.FCMTokens").
		FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
			for _, result := range results {
				switch result.Schedule.RecurringType {
				case adapters.RECURRING_TYPE_TIME:
					for _, slot := range *result.Schedule.TimeSlots {
						if slot.Hour() == now.Hour() && slot.Minute() == now.Minute() {
							for _, fcmToken := range result.User.FCMTokens {
								_, sendErr := fcmClient.Send(ctx, &messaging.Message{
									Notification: &messaging.Notification{
										Title: "Medication Reminder",
										Body:  "It's time to take your medication!",
									},
									Token: fcmToken.Token,
								})

								if sendErr != nil {
									log.Printf("Failed to send message: %v\n", sendErr)
								}
							}

							if err != nil {
								log.Printf("Failed to send message: %v\n", err)
							}
						}
					}
				}
			}

			return nil
		})



	return nil
}

func SetupWorkers(db *sql.DB, gormDB *gorm.DB) error {
	periodicJobs := []*river.PeriodicJob{
		river.NewPeriodicJob(
			river.PeriodicInterval(1*time.Minute),
			func() (river.JobArgs, *river.InsertOpts) {
				return MedicationScheduleWorkerArgs{}, nil
			},
			&river.PeriodicJobOpts{RunOnStart: true},
		),
	}

	InitFirebaseApp()

	workers := river.NewWorkers()
	river.AddWorker(workers, &MedicationScheduleWorker{DB: gormDB, firebaseApp: GetFirebaseApp()})

	riverClient, err := river.NewClient(riverdatabasesql.New(db), &river.Config{
		PeriodicJobs: periodicJobs,
		Queues: map[string]river.QueueConfig{
			river.QueueDefault: {MaxWorkers: 1},
		},
		Workers: workers,
	})

	if err != nil {
		return err
	}

	if err := riverClient.Start(context.Background()); err != nil {
		log.Fatalf("Failed to run river client: %v\n", err)
	}

	return nil
}
