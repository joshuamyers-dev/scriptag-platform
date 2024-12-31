package config

import (
	"context"
	"database/sql"
	adapters "go-api/adapters/models"
	"log"
	"time"

	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverdatabasesql"
	"gorm.io/gorm"
)

type MedicationScheduleWorkerArgs struct{}

func (MedicationScheduleWorkerArgs) Kind() string { return "medication_schedule_worker" }

type MedicationScheduleWorker struct {
	river.WorkerDefaults[MedicationScheduleWorkerArgs]
	DB *gorm.DB
}

func (w *MedicationScheduleWorker) Work(ctx context.Context, job *river.Job[MedicationScheduleWorkerArgs]) error {
	var results []*adapters.GormUserMedication
	var now = time.Now()

	_ = w.DB.Joins("Schedule", w.DB.Where("? >= start_date", now)).
		Joins("User").
		FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
			for _, result := range results {
				switch result.Schedule.RecurringType {
				case adapters.RECURRING_TYPE_TIME:
					for _, slot := range *result.Schedule.TimeSlots {
						if slot.Equal(time.Now()) {
							log.Printf("Time to take medication %s\n", result.Medication.BrandName)
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

	workers := river.NewWorkers()
	river.AddWorker(workers, &MedicationScheduleWorker{DB: gormDB})

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
