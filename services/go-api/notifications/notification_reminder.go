package notifications

import (
	"context"
	"log"

	"firebase.google.com/go/messaging"
	"gorm.io/gorm"
)

func SendFCMMessage(fcmClient *messaging.Client, ctx context.Context, db *gorm.DB, fcmToken string, title string, body string) error {
	_, sendErr := fcmClient.Send(ctx, &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Token: fcmToken,
		APNS: &messaging.APNSConfig{
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Sound: "default",
				},
			},
		},
	})

	if sendErr != nil {
		log.Printf("Failed to send message: %v\n", sendErr)

		if messaging.IsRegistrationTokenNotRegistered(sendErr) {
			log.Printf("Removing invalid token: %v\n", fcmToken)
			db.Delete(&fcmToken, "token = ?", fcmToken)
		}

		return sendErr
	}

	return sendErr
}
