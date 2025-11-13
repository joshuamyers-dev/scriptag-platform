package importer

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"cloud.google.com/go/storage"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
	"google.golang.org/api/option"
	"gorm.io/gorm"
)

const (
	BucketName = "scriptag-public"
	FileName   = "processed_medications.csv"
)

// downloadFromGCS downloads a file from Google Cloud Storage
func downloadFromGCS(ctx context.Context, bucketName, objectName, destFileName string) error {
	client, err := storage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		return fmt.Errorf("storage.NewClient: %v", err)
	}
	defer client.Close()

	// Create the destination file
	destFile, err := os.Create(destFileName)
	if err != nil {
		return fmt.Errorf("os.Create: %v", err)
	}
	defer destFile.Close()

	// Download the object
	src, err := client.Bucket(bucketName).Object(objectName).NewReader(ctx)
	if err != nil {
		return fmt.Errorf("Bucket(%q).Object(%q).NewReader: %v", bucketName, objectName, err)
	}
	defer src.Close()

	if _, err := io.Copy(destFile, src); err != nil {
		return fmt.Errorf("io.Copy: %v", err)
	}

	return nil
}

func Run(gormDB *gorm.DB) {
	ctx := context.Background()
	
	// Create a temporary directory for the downloaded file
	tempDir, err := os.MkdirTemp("", "medications")
	if err != nil {
		panic(fmt.Errorf("failed to create temp directory: %v", err))
	}
	defer os.RemoveAll(tempDir) // Clean up when done

	// Set the destination file path
	destFilePath := filepath.Join(tempDir, FileName)

	// Download the CSV file from GCS
	fmt.Println("Downloading medications data from GCS bucket...")
	err = downloadFromGCS(ctx, BucketName, FileName, destFilePath)
	if err != nil {
		panic(fmt.Errorf("failed to download file from GCS: %v", err))
	}

	// Open the downloaded file
	file, err := os.Open(destFilePath)
	if err != nil {
		panic(fmt.Errorf("failed to open downloaded file: %v", err))
	}
	defer file.Close()

	// Read CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		panic(err)
	}

	// Process medications data
	medications := make([]core.Medication, 0)
	for i, record := range records {
		// Skip header row
		if i == 0 {
			continue
		}

		if len(record) >= 3 {
			medications = append(medications, core.Medication{
				BrandName:        record[0],
				ActiveIngredient: record[1],
				Strength:         record[2],
			})
		}
	}

	// Prepare batch insert
	medicationInsertBatch := make([]*models.Medication, 0)
	for _, med := range medications {
		medicationInsertBatch = append(medicationInsertBatch, &models.Medication{
			BrandName:        med.BrandName,
			ActiveIngredient: med.ActiveIngredient,
			Strength:         med.Strength,
		})
	}
	
	// Insert data into database
	fmt.Printf("Importing %d medications into database...\n", len(medicationInsertBatch))
	gormDB.CreateInBatches(medicationInsertBatch, 1000)
	fmt.Println("Import completed successfully")
}
