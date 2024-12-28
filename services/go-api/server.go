package main

import (
	"fmt"
	repository "go-api/adapters/repositories"
	"go-api/auth"
	"go-api/config"
	"go-api/graph"
	"go-api/service"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	db, err := config.InitDB()

	if err != nil {
		log.Panicf("failed to connect database: %v", err)
	}

	fmt.Println("Database connection successful, migrating...")

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	medRepo := repository.NewMedicationRepository(db)
	medService := service.NewMedicationService(medRepo)
	userMedRepo := repository.NewUserMedicationRepository(db)
	userMedService := service.NewUserMedicationService(userMedRepo)

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		MedicationService: medService,
		UserService: userService,
		UserMedicationService: userMedService,
	}}))

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", auth.Middleware(userService)(srv))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
