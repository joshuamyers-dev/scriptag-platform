package main

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"time"

	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverdatabasesql"
)

type MedicationScheduleWorkerArgs struct {
	// Strings is a slice of strings to sort.
	UserMedications []string `json:"strings"`
}

func (MedicationScheduleWorkerArgs) Kind() string { return "sort" }

type MedicationScheduleWorker struct {
	river.WorkerDefaults[MedicationScheduleWorkerArgs]
}

func (w *MedicationScheduleWorker) Work(ctx context.Context, job *river.Job[MedicationScheduleWorkerArgs]) error {
	sort.Strings(job.Args.UserMedications)
	fmt.Printf("Sorted strings: %+v\n", job.Args.UserMedications)
	return nil
}

func SetupWorkers(db *sql.DB) error {
	periodicJobs := []*river.PeriodicJob{
		river.NewPeriodicJob(
			river.PeriodicInterval(1*time.Minute),
			func() (river.JobArgs, *river.InsertOpts) {
				return MedicationScheduleWorkerArgs{}, nil
			},
			&river.PeriodicJobOpts{RunOnStart: true},
		),
	}

	_, err := river.NewClient(riverdatabasesql.New(db), &river.Config{
		PeriodicJobs: periodicJobs,
	})

	if err != nil {
		return err
	}

	return nil
}
