package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/adapters/loaders"
	repository "github.com/joshnissenbaum/scriptag-platform/services/go-api/adapters/repositories"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/auth"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/config"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/graph"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/scripts/importer"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/service"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
)

const defaultPort = "8080"

func main() {
	if os.Getenv("ENVIRONMENT") == "development" {
		err := godotenv.Load()
		if err != nil {
			log.Fatalf("Error loading .env file")
		}
	}

	os.Setenv("TZ", "UTC")

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	db, _, err := config.InitDB()

	if err != nil {
		log.Panicf("failed to connect database: %v", err)
	}

	var count int64

	db.Model(&models.Medication{}).Count(&count)

	if count == 0 {
		importer.Run(db)
	}

	fmt.Println("database connection successful")

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	medRepo := repository.NewMedicationRepository(db)
	medService := service.NewMedicationService(medRepo)
	userMedRepo := repository.NewUserMedicationRepository(db, userRepo)
	userMedService := service.NewUserMedicationService(userMedRepo)

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		GormDB:                db,
		MedicationService:     medService,
		UserService:           userService,
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
	http.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	log.Printf("server launched at http://localhost:%s 🚀", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
