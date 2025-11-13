package notifications

import (
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/utils"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
	"gorm.io/gorm"
)

func QueueNotifications(schedule *core.MedicationSchedule, db *gorm.DB) error {
	var notifications []time.Time

	switch schedule.MethodType {
	case models.METHOD_TYPE_PERIODS:
		totalCycleDays := *schedule.UseForDays + *schedule.PauseForDays
		if totalCycleDays == 0 {
			break
		}

		scheduleStartDateUtc := schedule.StartDate.UTC()
		timeNowUtc := time.Now().UTC()
		elapsedDays := int(time.Since(scheduleStartDateUtc).Hours() / 24)

		// Current position in the cycle (in days)
		cycleDay := elapsedDays % totalCycleDays

		// Calculate how many complete cycles we can fit in 30 days
		daysToSchedule := 30
		cyclesInPeriod := (daysToSchedule + cycleDay) / totalCycleDays
		if (daysToSchedule+cycleDay)%totalCycleDays > 0 {
			cyclesInPeriod++
		}

		// For each cycle, add notifications for the "use" days
		for cycle := range cyclesInPeriod {
			cycleStartDay := cycle * totalCycleDays - cycleDay
			for useDay := range *schedule.UseForDays {
				notificationDay := cycleStartDay + useDay
				if notificationDay > 0 && notificationDay <= daysToSchedule {
					notifications = append(notifications, timeNowUtc.AddDate(0, 0, notificationDay))
				}
			}
		}

	case models.METHOD_TYPE_INTERVALS:
		timeNow := time.Now().UTC()
		scheduleStartDateUtc := schedule.StartDate.UTC()
		elapsedHours := max(timeNow.Sub(scheduleStartDateUtc).Hours(), 0)
		elapsedDays := int(elapsedHours / 24)

		if schedule.DaysInterval != nil {
			intervalDays := int(*schedule.DaysInterval)

			if intervalDays == 0 {
				return nil
			}

			if timeNow.Year() == scheduleStartDateUtc.Year() && timeNow.YearDay() == scheduleStartDateUtc.YearDay() {
				notifications = append(notifications, timeNow)
			}

			cyclesCompleted := elapsedDays / intervalDays
			daysToSchedule := 30

			// Calculate how many intervals we can fit in the next 30 days
			numIntervals := daysToSchedule / intervalDays
			if daysToSchedule%intervalDays > 0 {
				numIntervals++
			}

			// Add notifications for each interval
			for i := 1; i <= numIntervals; i++ {
				// Calculate the start of the next cycle
				daysToAdd := (cyclesCompleted + i) * intervalDays
				nextCycleStart := scheduleStartDateUtc.AddDate(0, 0, daysToAdd)
				
				// Only add if within our scheduling window
				hoursUntilNotification := nextCycleStart.Sub(timeNow).Hours()
				if hoursUntilNotification <= float64(daysToSchedule*24) {
					notifications = append(notifications, nextCycleStart)
				}
			}
		}

	case models.METHOD_TYPE_DAYS:
		if schedule.DaysOfWeek != nil {
			timeNowUtc := time.Now().UTC()
			
			// Schedule for the next 30 days
			for dayOffset := 0; dayOffset < 30; dayOffset++ {
				// Calculate the date to check
				checkDate := timeNowUtc.AddDate(0, 0, dayOffset)
				checkWeekday := checkDate.Weekday()

				// Check each specified day of the week
				for _, daySpec := range schedule.DaysOfWeek {
					weekday, err := utils.ConvertShortDayToTime(*daySpec)
					if err != nil {
						return err
					}

					if weekday.String() == checkWeekday.String() {
						notifications = append(notifications, checkDate)
					}
				}
			}
		}
	}

	// Recurring type logic
	switch schedule.RecurringType {
	case models.RECURRING_TYPE_TIME:
		// Handle time-based recurring schedule
		if schedule.TimeSlots != nil {
			var updatedNotifications []time.Time

			for _, baseNotification := range notifications {
				for _, timeSlot := range schedule.TimeSlots {
					// Create notification for each time slot on the base date
					slotTime := time.Date(
						baseNotification.Year(),
						baseNotification.Month(),
						baseNotification.Day(),
						timeSlot.Hour(),
						timeSlot.Minute(),
						0, 0, time.UTC,
					)
					updatedNotifications = append(updatedNotifications, slotTime)
				}
			}
			notifications = updatedNotifications
		}

	case models.RECURRING_TYPE_INTERVALS:
		// Handle intervals-based recurring schedule
		if schedule.HoursInterval != nil {
			var updatedNotifications []time.Time
			for _, notification := range notifications {
				// Start from the beginning of the next day
				startOfNextDay := time.Date(notification.Year(), notification.Month(), notification.Day(), 0, 0, 0, 0, time.UTC)
				// Calculate notifications for the entire next day
				for i := range 24 / int(*schedule.HoursInterval) {
					notificationDate := startOfNextDay.Add(time.Duration(i*int(*schedule.HoursInterval)) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				}
			}
			notifications = updatedNotifications
		}

	case models.RECURRING_TYPE_PERIODS:
		// Handle periods-based recurring schedule
		if schedule.UseForHours != nil && schedule.PauseForHours != nil {
			var updatedNotifications []time.Time
			totalCycleHours := *schedule.UseForHours + *schedule.PauseForHours

			for _, notification := range notifications {
				elapsedHours := int(time.Now().UTC().Sub(notification).Hours())
				cyclePosition := elapsedHours % totalCycleHours

				if cyclePosition < int(*schedule.UseForHours) {
					notificationDate := notification.Add(time.Duration(*schedule.UseForHours) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				} else {
					nextUsePeriodStart := notification.Add(time.Duration(totalCycleHours-cyclePosition) * time.Hour)
					notificationDate := nextUsePeriodStart.Add(time.Duration(*schedule.UseForHours) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				}
			}
			notifications = updatedNotifications
		}
	}

	var notificationsBatch []*models.NotificationDelivery
	var consumptionBatch []*models.UserMedicationConsumption

	for _, notificationDate := range notifications {
		notificationsBatch = append(notificationsBatch, &models.NotificationDelivery{
			UserMedicationScheduleID: schedule.ID,
			NotificationDate:         notificationDate.UTC(),
			Status:                   models.NOTIFICATION_STATUS_PENDING,
		})
	}

	for _, notificationDate := range notifications {
		consumptionBatch = append(consumptionBatch, &models.UserMedicationConsumption{
			UserMedicationID: *schedule.UserMedicationID,
			DueDate:          notificationDate.UTC(),
			Status:           models.LOG_STATUS_UPCOMING,
		})
	}

	if len(notificationsBatch) > 0 {
		err := db.Create(&notificationsBatch).Error

		if err != nil {
			return err
		}
	}

	if len(consumptionBatch) > 0 {
		err := db.Create(&consumptionBatch).Error

		if err != nil {
			return err
		}
	}

	return nil
}

func getNextDayOfWeek(targetDay time.Weekday) time.Time {
	now := time.Now().UTC()

	// Calculate the next occurrence of the target day
	daysUntilTarget := (int(targetDay) - int(now.Weekday()) + 7) % 7
	if daysUntilTarget == 0 {
		daysUntilTarget = 7
	}
	nextOccurrence := now.AddDate(0, 0, daysUntilTarget)

	return nextOccurrence
}

func nextWeekdayFromStart(startDate time.Time, weekday time.Weekday) time.Time {
	daysUntilTarget := (int(weekday) - int(startDate.Weekday()) + 7) % 7
	if daysUntilTarget == 0 {
		daysUntilTarget = 7
	}
	return startDate.AddDate(0, 0, daysUntilTarget)
}
