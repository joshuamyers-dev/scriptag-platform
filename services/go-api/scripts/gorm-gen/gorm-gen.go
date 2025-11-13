package main

import (
	"log"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/config"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
	"gorm.io/gen"
)

// Dynamic SQL
type Querier interface {
}

func main() {
	g := gen.NewGenerator(gen.Config{
		OutPath: "./db/",
		Mode:    gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface, // generate mode
	})

	gormdb, _, err := config.InitDB()

	if err != nil {
		log.Fatal(err)
	}

	// gormdb, _ := gorm.Open(mysql.Open("root:@(127.0.0.1:3306)/demo?charset=utf8mb4&parseTime=True&loc=Local"))
	g.UseDB(gormdb) // reuse your gorm db

	// Generate basic type-safe DAO API for struct `model.User` following conventions
	// Generate basic type-safe DAO API for struct `model.User` following conventions
	g.ApplyBasic(models.User{},
		models.Medication{},
		models.UserMedication{},
		models.UserFCMToken{},
		models.UserMedicationSchedule{},
	)

	// Generate Type Safe API with Dynamic SQL defined on Querier interface for `model.User` and `model.Company`
	g.ApplyInterface(func(Querier) {}, models.User{})

	// Generate the code
	g.Execute()
}
