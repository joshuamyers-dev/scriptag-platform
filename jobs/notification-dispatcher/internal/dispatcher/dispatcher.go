package dispatcher

import (
	"context"
	"log"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/messaging"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
	"gorm.io/gorm"
)

type NotificationDispatcher struct {
	DB          *gorm.DB
	FirebaseApp *firebase.App
}

func (d *NotificationDispatcher) ProcessNotifications(ctx context.Context) error {
	var results []*models.NotificationDelivery
	var now = time.Now().UTC()
	fcmClient, err := d.FirebaseApp.Messaging(ctx)

	if err != nil {
		log.Printf("Failed to create Firebase Messaging client: %v\n", err)
		return err
	}

	err = d.DB.
		Where("DATE_TRUNC('minute', notification_date::timestamp) = DATE_TRUNC('minute', ?::timestamp)", now).
		Preload("UserMedicationSchedule.UserMedication.User.FCMTokens").
		Preload("UserMedicationSchedule.UserMedication.Medication").
		FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
			for _, result := range results {
				log.Printf("Sending notification for user medication schedule %s\n", result.UserMedicationScheduleID)

			
				for _, token := range result.UserMedicationSchedule.UserMedication.User.FCMTokens {
					message := &messaging.Message{
						Token: token.Token,
						Notification: &messaging.Notification{
							Title: "Medication Reminder",
							Body:  "It's time to take your " + models.BrandNameIngredientName(result.UserMedicationSchedule.UserMedication.Medication) + ". Tap your NFC tag before taking your medication.",
						},
					}

					_, err := fcmClient.Send(ctx, message)
					if err != nil {
						log.Printf("Error sending FCM message: %v\n", err)
						if messaging.IsRegistrationTokenNotRegistered(err) {
							if err := d.DB.Unscoped().Delete(&token).Error; err != nil {
								log.Printf("Error deleting invalid token: %v\n", err)
							}
						}
					}
				}
			}
			return nil
		}).Error

	if err != nil {
		log.Printf("Error processing notifications: %v\n", err)
		return err
	}

	return nil
}
