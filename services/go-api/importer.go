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
	file, err := os.Open("./medications.csv")
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

		brandName := toTitleCase(row[3])
		genericName := toTitleCase(row[5])
		dosageType := toTitleCase(row[6])
		strength := toTitleCase(row[14] + row[15])

		key := brandName + "|" + genericName

		if med, exists := medications[key]; exists {
			dosageExits := false

			for _, existingDosage := range med.DosageForms {
				if existingDosage == dosageType {
					dosageExits = true
					break
				}
			}

			if !dosageExits {
				med.DosageForms = append(med.DosageForms, dosageType)
			}

			med.Strengths = append(med.Strengths, strength)
		} else {
			medications[key] = &core.Medication{
				BrandName:        brandName,
				ActiveIngredient: genericName,
				DosageForms:      []string{dosageType},
				Strengths:        []string{strength},
			}
		}
	}

	medicationInsertBatch := make([]*adapters.GormMedication, 0)

	for _, med := range medications {
		medicationInsertBatch = append(medicationInsertBatch, &adapters.GormMedication{
			BrandName:            med.BrandName,
			ActiveIngredientName: med.ActiveIngredient,
			DosageForms:          med.DosageForms,
			Strengths:            med.Strengths,
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
