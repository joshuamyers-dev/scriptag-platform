package main

import (
	"encoding/csv"
	"go-api/adapters"
	"go-api/config"
	"go-api/core"
	"log"
	"os"
	"strings"
)

func main() {
	file, err := os.Open("./processed_medications.csv")
	if err != nil {
		panic(err)
	}

	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1 // Allow variable number of fields
	data, err := reader.ReadAll()
	if err != nil {
		panic(err)
	}

	medications := make(map[string]*core.Medication)

	for i, row := range data {
		if i == 0 {
			continue
		}

		brandName := row[0]
		genericName := row[1]
		strength := row[2]

		key := brandName + "|" + genericName

		if _, exists := medications[key]; exists {
			continue
		} else {
			medications[key] = &core.Medication{
				BrandName:        brandName,
				ActiveIngredient: genericName,
				Strength:        strength,
			}
		}
	}

	medicationInsertBatch := make([]*adapters.GormMedication, 0)

	for _, med := range medications {
		medicationInsertBatch = append(medicationInsertBatch, &adapters.GormMedication{
			BrandName:        med.BrandName,
			ActiveIngredient: med.ActiveIngredient,
			Strength:         med.Strength,
		})
	}

	db, err := config.InitDB()

	if err != nil {
		log.Panicf("failed to connect database: %v", err)
	}

	db.CreateInBatches(medicationInsertBatch, 1000)
}

func toTitleCase(s string) string {
	words := strings.Fields(s)
	for i, word := range words {
		words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
	}
	return strings.Join(words, " ")
}
