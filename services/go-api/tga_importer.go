package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
)

const baseURL = "https://data.tga.gov.au/ARTGSearch/ARTGWebService.svc/JSON/ARTGValueSearch/?entrytype=Medicine&pagestart=%d&pageend=%d"

type Medication struct {
    Name string `json:"Name"`
}

type Response struct {
	Results []struct {
		Name string `json:"Name"`
	} `json:"Results"`
}

func main() {
	pageStart := 1
	pageEnd := 1000
	var medications []Medication

	for {
		url := fmt.Sprintf(baseURL, pageStart, pageEnd)
		resp, err := http.Get(url)
		if err != nil {
			log.Fatalf("Failed to make GET request: %v", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}

		var response Response
		err = json.Unmarshal(body, &response)
		if err != nil {
			log.Fatalf("Failed to unmarshal JSON response: %v", err)
		}

		if len(response.Results) == 0 {
			fmt.Println("No more results found. Exiting loop.")
			break
		}

		for _, result := range response.Results {
            medications = append(medications, Medication{
                Name: result.Name,
            })
        }

		fmt.Printf("Fetched %d results. Continuing to next page...\n", len(response.Results))
		pageStart += 1000
		pageEnd += 1000
	}

	file, err := os.Create("medications.csv")
    if err != nil {
        log.Fatalf("Failed to create CSV file: %v", err)
    }
    defer file.Close()

    writer := csv.NewWriter(file)
    defer writer.Flush()

    // Write CSV header
    writer.Write([]string{"Name"})

    // Write medication names to CSV
    for _, med := range medications {
        writer.Write([]string{med.Name})
    }

    fmt.Println("CSV file created successfully.")
}

func parseMedicationName(name string) (string, string, string) {
	// Regular expression to match the brand name, active ingredient, and strength
	re := regexp.MustCompile(`^(?P<BrandName>[A-Z0-9 ]+)\s+(?P<ActiveIngredient>.+?)(\s+\((?P<Strength>.+)\))?$`)

	matches := re.FindStringSubmatch(name)
	if len(matches) == 0 {
		return "", "", ""
	}

	brandName := strings.TrimSpace(matches[1])
	activeIngredient := strings.TrimSpace(matches[2])
	strength := ""
	if len(matches) > 4 {
		strength = strings.TrimSpace(matches[4])
	}

	// Further split active ingredient and strength if strength is still part of active ingredient
	if strength == "" {
		reStrength := regexp.MustCompile(`(.+?)\s+(\d+.*)`)
		subMatches := reStrength.FindStringSubmatch(activeIngredient)
		if len(subMatches) == 3 {
			activeIngredient = strings.TrimSpace(subMatches[1])
			strength = strings.TrimSpace(subMatches[2])
		}
	}

	// Remove unnecessary details from the active ingredient
	unnecessaryDetails := []string{"tablet blister pack", "lotion bottle", "injection ampoule", "oral liquid bottle", "cream tube", "powder for injection vial", "eye drops bottle", "suppository strip pack", "sustained release tablets blister pack", "capsule blister pack", "insufflation dry powder inhaler", "inhalation ampoule", "mouthwash bottle", "lozenge blister pack", "solution bottle", "ointment jar", "syrup bottle", "oral liquid bottle", "cream jar", "injection syringe", "solution sachet", "bar", "bath oil solution bottle", "cream tube", "lotion bottle", "cream jar"}
	for _, detail := range unnecessaryDetails {
		activeIngredient = strings.ReplaceAll(activeIngredient, detail, "")
	}

	activeIngredient = strings.TrimSpace(activeIngredient)

	// Extract strength directly after the active ingredient
	reStrengthDirect := regexp.MustCompile(`(?i)(\d+(\.\d+)?\s*(mg|microgram|g|mcg|mL|%)\s*(/mL|/actuation|/g|/mL|/mg|/mcg|/%)?)`)
	strengthMatches := reStrengthDirect.FindStringSubmatch(name)
	if len(strengthMatches) > 0 {
		strength = strings.TrimSpace(strengthMatches[0])
	}

	return toTitleCase(brandName), toTitleCase(activeIngredient), strings.Replace(strength, " ", "", -1)
}

func toTitleCase(s string) string {
	words := strings.Fields(s)
	for i, word := range words {
		words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
	}
	return strings.Join(words, " ")
}
