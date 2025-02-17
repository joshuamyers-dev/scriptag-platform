package workers

import (
	"context"
	"database/sql"
	"go-api/config"
	"log"
	"time"

	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverdatabasesql"
	"gorm.io/gorm"
)

func SetupWorkers(db *sql.DB, gormDB *gorm.DB) error {
	// schedule, err := cron.ParseStandard("0 1 * * *")

	// if err != nil {
	// 	panic("invalid cron schedule")
	// }

	periodicJobs := []*river.PeriodicJob{
		river.NewPeriodicJob(
			river.PeriodicInterval(1*time.Minute),
			func() (river.JobArgs, *river.InsertOpts) {
				return MedicationScheduleWorkerArgs{}, nil
			},
			&river.PeriodicJobOpts{RunOnStart: true},
		),
		river.NewPeriodicJob(
			river.PeriodicInterval(1*time.Minute),
			func() (river.JobArgs, *river.InsertOpts) {
				return NotificationCreatorWorkerArgs{}, nil
			},
			&river.PeriodicJobOpts{RunOnStart: false},
		),
	}

	workers := river.NewWorkers()

	river.AddWorker(workers, &MedicationScheduleWorker{DB: gormDB, firebaseApp: config.GetFirebaseApp()})
	river.AddWorker(workers, &NotificationCreatorWorker{DB: gormDB})

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
