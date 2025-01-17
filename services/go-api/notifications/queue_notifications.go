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
			// If user did not specify valid days, skip
			break
		}

		// Calculate how many full days have passed since StartDate
		elapsedDays := int(time.Since(*schedule.StartDate).Hours() / 24)

		// Current position in the cycle (in days)
		cycleDay := elapsedDays % totalCycleDays

		// If within useDays portion, we are "in use"
		if cycleDay < *schedule.UseForDays {
			// Schedule the next notification for tomorrow
			notifications = append(notifications, time.Now().AddDate(0, 0, 1))
		} else {
			// We are in the pause period; schedule the next "use" day
			daysUntilUse := totalCycleDays - cycleDay
			notifications = append(notifications, time.Now().AddDate(0, 0, daysUntilUse))
		}

	case adapters.METHOD_TYPE_INTERVALS:
		// Handle "Use for every X days" scenario
		if schedule.DaysInterval != nil {
			elapsedDays := int(time.Since(*schedule.StartDate).Hours() / 24)
			intervalDays := int(*schedule.DaysInterval)

			if intervalDays == 0 {
				break
			}

			if time.Now().Year() == schedule.StartDate.Year() && time.Now().YearDay() == schedule.StartDate.YearDay() {
				notifications = append(notifications, time.Now())
			}
	
			cyclesCompleted := elapsedDays / intervalDays
			nextCycleStart := schedule.StartDate.AddDate(0, 0, (cyclesCompleted+1)*intervalDays)
			notifications = append(notifications, nextCycleStart)
		}

	case adapters.METHOD_TYPE_DAYS:
		// Handle "Use for every X days" scenario
		if schedule.DaysOfWeek != nil {
			today := time.Now().Weekday()
			nextDay := time.Now().AddDate(0, 0, 1).Weekday()

			for _, day := range schedule.DaysOfWeek {
				// Calculate the next occurrence of the specified day
				timeWeekday, err := utils.ConvertShortDayToTime(*day)

				if err != nil {
					return err
				}

				if timeWeekday.String() == today.String() {
					notifications = append(notifications, time.Now())
				}

				if timeWeekday.String() == nextDay.String() {
					nextOccurrence := nextWeekdayFromStart(*schedule.StartDate, *timeWeekday)
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
					notificationDate := time.Date(notification.Year(), notification.Month(), notification.Day(), slot.Hour(), slot.Minute(), 0, 0, notification.Location())
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
				startOfNextDay := time.Date(notification.Year(), notification.Month(), notification.Day(), 0, 0, 0, 0, notification.Location())
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
				elapsedHours := int(time.Since(notification).Hours())
				cyclePosition := elapsedHours % totalCycleHours
	
				if cyclePosition < int(*schedule.UseForHours) {
					notificationDate := notification.Add(time.Duration(*schedule.UseForHours) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				} else {
					nextUsePeriodStart := notification.Add(time.Duration(totalCycleHours - cyclePosition) * time.Hour)
					notificationDate := nextUsePeriodStart.Add(time.Duration(*schedule.UseForHours) * time.Hour)
					updatedNotifications = append(updatedNotifications, notificationDate)
				}
			}
			notifications = updatedNotifications
		}
	}

	// Create notifications in the database
	for _, notificationDate := range notifications {
		err := createNotification(schedule.ID, notificationDate, db)
		if err != nil {
			return err
		}
	}

	return nil
}

func getNextDayOfWeek(targetDay time.Weekday) time.Time {
	now := time.Now()

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

func createNotification(scheduleID string, notificationDate time.Time, db *gorm.DB) error {
	notification := adapters.GormNotificationDelivery{
		UserMedicationScheduleID: scheduleID,
		NotificationDate:         notificationDate,
		Status:                   adapters.NOTIFICATION_STATUS_PENDING,
	}
	return db.Create(&notification).Error
}
