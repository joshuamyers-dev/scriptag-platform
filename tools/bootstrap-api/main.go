package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Directory structure for a Go API following hexagonal architecture
var directories = []string{
	// Main service directories
	"adapters",
	"adapters/loaders",
	"adapters/mappers",
	"adapters/repositories",
	"auth",
	"config",
	"core",
	"core/domain",
	"core/ports",
	"core/services",
	"db",
	"graph",
	"graph/model",
	"migrations",
	"notifications",
	"scripts",
	"service",
	"utils",

	// Shared models directory (outside the service)
	"../shared",
	"../shared/models",
}

// Files to create (empty)
var files = []string{
	"main.go",
	"go.mod",
	"go.sum",
	"Dockerfile",
	"start.sh",
	".gitignore",
	"README.md",
}

func main() {
	// Parse command line arguments
	basePath := flag.String("path", "", "Base path for the new service (required)")
	serviceName := flag.String("name", "api", "Name of the service")
	modulePath := flag.String("module", "github.com/joshnissenbaum/scriptag-platform", "Go module path")
	createFiles := flag.Bool("files", false, "Create empty files (default: false)")
	flag.Parse()

	// Validate base path
	if *basePath == "" {
		fmt.Println("Error: Base path is required")
		flag.Usage()
		os.Exit(1)
	}

	// Create the service directory
	servicePath := filepath.Join(*basePath, "services", *serviceName)
	fmt.Printf("Creating Go API service at: %s\n", servicePath)

	// Create directories
	for _, dir := range directories {
		dirPath := filepath.Join(*basePath, dir)
		if strings.HasPrefix(dir, "../") {
			// Handle shared directories that are outside the service directory
			dirPath = filepath.Join(*basePath, strings.TrimPrefix(dir, "../"))
		} else {
			dirPath = filepath.Join(servicePath, dir)
		}

		err := os.MkdirAll(dirPath, 0755)
		if err != nil {
			fmt.Printf("Error creating directory %s: %v\n", dirPath, err)
			os.Exit(1)
		}
		fmt.Printf("Created directory: %s\n", dirPath)
	}

	// Create empty files if requested
	if *createFiles {
		for _, file := range files {
			filePath := filepath.Join(servicePath, file)
			f, err := os.Create(filePath)
			if err != nil {
				fmt.Printf("Error creating file %s: %v\n", filePath, err)
				os.Exit(1)
			}
			f.Close()
			fmt.Printf("Created file: %s\n", filePath)
		}
	}

	fmt.Println("\nGo API service structure created successfully!")
	fmt.Println("\nNext steps:")
	fmt.Println("1. Initialize Go module: cd " + servicePath + " && go mod init " + *modulePath + "/services/" + *serviceName)
	fmt.Println("2. Create your domain models in the core/domain directory")
	fmt.Println("3. Define your ports (interfaces) in the core/ports directory")
	fmt.Println("4. Implement your business logic in the core/services directory")
	fmt.Println("5. Create adapters in the adapters directory")
}
