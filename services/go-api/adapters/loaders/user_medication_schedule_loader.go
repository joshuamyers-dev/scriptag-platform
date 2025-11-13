package loaders

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/graph/model"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/utils"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"

	"github.com/vikstrous/dataloadgen"
	"gorm.io/gorm"
)

type ctxKey string

const (
	loadersKey = ctxKey("dataloaders")
)

type medicationScheduleReader struct {
	db *gorm.DB
}

func (m *medicationScheduleReader) getMedicationSchedules(ctx context.Context, userMedicationIds []string) ([]*model.MyMedicationSchedule, []error) {
	var schedules []*models.UserMedicationSchedule
	err := m.db.Where("user_medication_id IN ?", userMedicationIds).Find(&schedules).Error
	if err != nil {
		return nil, []error{err}
	}

	results := make([]*model.MyMedicationSchedule, len(userMedicationIds))
	errs := make([]error, len(userMedicationIds))
	for i, id := range userMedicationIds {
		for _, schedule := range schedules {
			if schedule.UserMedicationID == id {
				var scheduledDays string
				var timesPerDay int

				switch schedule.MethodType {
				case models.METHOD_TYPE_DAYS:
					for index, day := range *schedule.DaysOfWeek {

						scheduledDays += utils.ConvertShortDayToMid(day)

						if index < len(*schedule.DaysOfWeek)-1 {
							scheduledDays += ", "
						}
					}

					if len(*schedule.DaysOfWeek) == 7 {
						scheduledDays = "Daily"
					}

				case models.METHOD_TYPE_INTERVALS:
					if *schedule.DaysInterval > 1 {
						scheduledDays = fmt.Sprintf("Every %d days", *schedule.DaysInterval)
					} else {
						scheduledDays = "Daily"
					}

				case models.METHOD_TYPE_PERIODS:
					scheduledDays = fmt.Sprintf("Every %d days with %d days break", *schedule.UseForDays, *schedule.PauseForDays)
				}

				switch schedule.RecurringType {
				case models.RECURRING_TYPE_TIME:
					timesPerDay = len(*schedule.TimeSlots)

				case models.RECURRING_TYPE_INTERVALS:
					timesPerDay = 24 / int(*schedule.HoursInterval)

				case models.RECURRING_TYPE_PERIODS:
					cycleHours := *schedule.UseForHours + *schedule.PauseForHours
					completeCycles := 24 / cycleHours
					timesPerDay = int(completeCycles)
					remainingHours := 24 % cycleHours

					if remainingHours >= *schedule.UseForHours {
						timesPerDay++
					}
				}

				results[i] = &model.MyMedicationSchedule{
					ID:             schedule.ID,
					TimesPerDay:    &timesPerDay,
					ScheduledDays:  &scheduledDays,
					DosesRemaining: utils.ConvertUintToIntPointer(schedule.DosesAmount),
				}
				break
			}
		}
		if results[i] == nil {
			errs[i] = gorm.ErrRecordNotFound
		}
	}
	return results, errs
}

type Loaders struct {
	MedicationScheduleLoader *dataloadgen.Loader[string, *model.MyMedicationSchedule]
}

func NewLoaders(db *gorm.DB) *Loaders {
	msr := &medicationScheduleReader{db: db}
	return &Loaders{
		MedicationScheduleLoader: dataloadgen.NewLoader(msr.getMedicationSchedules, dataloadgen.WithWait(time.Millisecond)),
	}
}

func Middleware(db *gorm.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		loader := NewLoaders(db)
		r = r.WithContext(context.WithValue(r.Context(), loadersKey, loader))
		next.ServeHTTP(w, r)
	})
}

func For(ctx context.Context) *Loaders {
	return ctx.Value(loadersKey).(*Loaders)
}

func GetMedicationSchedule(ctx context.Context, scheduleID string) (*model.MyMedicationSchedule, error) {
	loaders := For(ctx)
	return loaders.MedicationScheduleLoader.Load(ctx, scheduleID)
}

func GetMedicationSchedules(ctx context.Context, scheduleIDs []string) ([]*model.MyMedicationSchedule, error) {
	loaders := For(ctx)
	return loaders.MedicationScheduleLoader.LoadAll(ctx, scheduleIDs)
}
