package notifications

import (
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/utils"
	"time"

	"gorm.io/gorm"
)

func QueueNotifications(schedule *core.MedicationSchedule, db *gorm.DB) error {
	var notifications []time.Time

	switch schedule.MethodType {
	case adapters.METHOD_TYPE_PERIODS:
		totalCycleDays := *schedule.UseForDays + *schedule.PauseForDays
		if totalCycleDays == 0 {
			break
		}

		scheduleStartDateUtc := schedule.StartDate.UTC()
		timeNowUtc := time.Now().UTC()
		elapsedDays := int(time.Since(scheduleStartDateUtc).Hours() / 24)

		// Current position in the cycle (in days)
		cycleDay := elapsedDays % totalCycleDays

		// If within useDays portion, we are "in use"
		if cycleDay < *schedule.UseForDays {
			// Schedule the next notification for tomorrow
			notifications = append(notifications, timeNowUtc.AddDate(0, 0, 1))
		} else {
			// We are in the pause period; schedule the next "use" day
			daysUntilUse := totalCycleDays - cycleDay
			notifications = append(notifications, timeNowUtc.AddDate(0, 0, daysUntilUse))
		}

	case adapters.METHOD_TYPE_INTERVALS:
		timeNow := time.Now().UTC()
		scheduleStartDateUtc := schedule.StartDate.UTC()
		elapsedHours := timeNow.Sub(scheduleStartDateUtc).Hours()

		if elapsedHours < 0 {
			elapsedHours = 0
		}

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
			nextCycleStart := scheduleStartDateUtc.AddDate(0, 0, (cyclesCompleted+1)*intervalDays)
			notifications = append(notifications, nextCycleStart)
		}

	case adapters.METHOD_TYPE_DAYS:
		if schedule.DaysOfWeek != nil {
			timeNowUtc := time.Now().UTC()
			today := timeNowUtc.Weekday()
			nextDay := timeNowUtc.AddDate(0, 0, 1).Weekday()

			for _, day := range schedule.DaysOfWeek {
				timeWeekday, err := utils.ConvertShortDayToTime(*day)

				if err != nil {
					return err
				}

				if timeWeekday.String() == today.String() {
					notifications = append(notifications, timeNowUtc)
				}

				if timeWeekday.String() == nextDay.String() {
					nextOccurrence := nextWeekdayFromStart(schedule.StartDate.UTC(), *timeWeekday)
					notifications = append(notifications, nextOccurrence)
				}
			}
		}
	}

	// Recurring type logic
	switch schedule.RecurringType {
	case adapters.RECURRING_TYPE_TIME:
		// Handle time-based recurring schedule
		if schedule.TimeSlots != nil {
			var updatedNotifications []time.Time

			for _, notification := range notifications {
				for _, slot := range schedule.TimeSlots {
					notificationDate := time.Date(notification.Year(), notification.Month(), notification.Day(), slot.Hour(), slot.Minute(), 0, 0, time.UTC)
					updatedNotifications = append(updatedNotifications, notificationDate)
				}
			}
			notifications = updatedNotifications
		}

	case adapters.RECURRING_TYPE_INTERVALS:
		// Handle intervals-based recurring schedule
		if schedule.HoursInterval != nil {
			var updatedNotifications []time.Time
			for _, notification := range notifications {
				// Start from the beginning of the next day
				startOfNextDay := time.Date(notification.Year(), notification.Month(), notification.Day(), 0, 0, 0, 0, time.UTC)
				// Calculate notifications for the entire next day
				for i := 0; i < 24/int(*schedule.HoursInterval); i++ {
					notificationDate := startOfNextDay.Add(time.Duration(i*int(*schedule.HoursInterval)) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				}
			}
			notifications = updatedNotifications
		}

	case adapters.RECURRING_TYPE_PERIODS:
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

	var notificationsBatch []*adapters.GormNotificationDelivery
	var consumptionBatch []*adapters.GormUserMedicationConsumption

	for _, notificationDate := range notifications {
		notificationsBatch = append(notificationsBatch, &adapters.GormNotificationDelivery{
			UserMedicationScheduleID: schedule.ID,
			NotificationDate:         notificationDate.UTC(),
			Status:                   adapters.NOTIFICATION_STATUS_PENDING,
		})

		consumptionBatch = append(consumptionBatch, &adapters.GormUserMedicationConsumption{
			UserMedicationID: *schedule.UserMedicationID,
			DueDate:          notificationDate.UTC(),
			Status:           adapters.LOG_STATUS_UPCOMING,
		})
	}

	if len(notificationsBatch) > 0 {
		err := db.Create(&notificationsBatch).Error

		if err != nil {
			return err
		}
	}

	if(len(consumptionBatch) > 0) {
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
