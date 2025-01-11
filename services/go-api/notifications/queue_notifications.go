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
		if schedule.HoursInterval != nil {
			elapsedHours := int(time.Since(*schedule.StartDate).Hours())

			intervalHours := int(*schedule.HoursInterval)

			if intervalHours == 0 {
				break
			}

			cyclesCompleted := elapsedHours / intervalHours

			nextCycleStart := schedule.StartDate.Add(
				time.Duration(cyclesCompleted+1) * time.Duration(intervalHours) * time.Hour,
			)

			notifications = append(notifications, nextCycleStart)
		}

	case adapters.METHOD_TYPE_DAYS:
		// Handle "Use for every X days" scenario
		if schedule.DaysOfWeek != nil {
			for _, day := range schedule.DaysOfWeek {
				// Calculate the next occurrence of the specified day
				timeWeekday, err := utils.ConvertShortDayToTime(*day)

				if err != nil {
					return err
				}

				notifications = append(notifications, getNextDayOfWeek(*timeWeekday, schedule.TimeSlots))
			}
		}
	}

	// Recurring type logic
	switch schedule.RecurringType {
	case adapters.RECURRING_TYPE_TIME:
		// Handle time-based recurring schedule
		if schedule.TimeSlots != nil {
			for _, slot := range schedule.TimeSlots {
				notifications = append(notifications, *slot)
			}
		}

	case adapters.RECURRING_TYPE_INTERVALS:
		// Handle intervals-based recurring schedule
		if schedule.UseForHours != nil && schedule.PauseForHours != nil {
			totalCycleHours := *schedule.UseForHours + *schedule.PauseForHours
			elapsedHours := int(time.Since(*schedule.StartDate).Hours())
			cyclePosition := elapsedHours % totalCycleHours

			if cyclePosition < int(*schedule.UseForHours) {
				for i, notification := range notifications {
					notifications[i] = notification.Add(time.Duration(*schedule.UseForHours) * time.Hour)
				}
			} else {
				for i, notification := range notifications {
					nextUsePeriodStart := notification.Add(time.Duration(totalCycleHours-cyclePosition) * time.Hour)
					notifications[i] = nextUsePeriodStart
				}
			}
		}

	case adapters.RECURRING_TYPE_PERIODS:
		// Handle periods-based recurring schedule
		if schedule.UseForHours != nil && schedule.PauseForHours != nil {
			totalCycleHours := *schedule.UseForHours + *schedule.PauseForHours
			elapsedHours := int(time.Since(*schedule.StartDate).Hours())
			cyclePosition := elapsedHours % totalCycleHours

			if cyclePosition < int(*schedule.UseForHours) {
				for i, notification := range notifications {
					notifications[i] = notification.Add(time.Duration(*schedule.UseForHours) * time.Hour)
				}
			} else {
				for i, notification := range notifications {
					nextUsePeriodStart := notification.Add(time.Duration(totalCycleHours-cyclePosition) * time.Hour)
					notifications[i] = nextUsePeriodStart.Add(time.Duration(*schedule.UseForHours) * time.Hour)
				}
			}
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

func createNotification(scheduleID string, notificationDate time.Time, db *gorm.DB) error {
	notification := adapters.GormNotificationDelivery{
		UserMedicationScheduleID: scheduleID,
		NotificationDate:         notificationDate,
		Status:                   adapters.NOTIFICATION_STATUS_PENDING,
	}
	return db.Create(&notification).Error
}
