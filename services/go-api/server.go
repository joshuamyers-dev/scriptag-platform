package main

import (
	"fmt"
	"go-api/adapters/loaders"
	repository "go-api/adapters/repositories"
	"go-api/auth"
	"go-api/config"
	"go-api/graph"
	"go-api/service"
	"go-api/workers"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	db, sqlDB, err := config.InitDB()

	if err != nil {
		log.Panicf("failed to connect database: %v", err)
	}

	config.InitFirebaseApp()

	err = workers.SetupWorkers(sqlDB, db)

	if err != nil {
		log.Printf("failed to setup workers: %v", err)
	}

	fmt.Println("Database connection successful, migrating...")

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	medRepo := repository.NewMedicationRepository(db)
	medService := service.NewMedicationService(medRepo)
	userMedRepo := repository.NewUserMedicationRepository(db)
	userMedService := service.NewUserMedicationService(userMedRepo)

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		GormDB: db,
		MedicationService: medService,
		UserService: userService,
		UserMedicationService: userMedService,
	}}))

    srv.AddTransport(transport.POST{})
    srv.AddTransport(transport.Options{})
    srv.AddTransport(transport.GET{})

	if os.Getenv("ENVIRONMENT") == "development" {
		srv.Use(extension.Introspection{})
	}

	loaderMiddleware := loaders.Middleware(db, srv)

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", auth.Middleware(userService)(loaderMiddleware))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
