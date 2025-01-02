package config

import (
	"context"
	"log"

	firebase "firebase.google.com/go"
)

var (
	firebaseApp *firebase.App
)

func GetFirebaseApp() *firebase.App {
	return firebaseApp
}

func InitFirebaseApp() {
	var err error
	firebaseApp, err = firebase.NewApp(context.Background(), nil)

	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}
}
