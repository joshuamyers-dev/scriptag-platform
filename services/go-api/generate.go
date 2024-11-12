package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run generate.go NAME")
		return
	}

	name := os.Args[1]
	name = strings.ToUpper(name[:1]) + name[1:]
	nameLower := strings.ToLower(name)

	generateFile(name, nameLower, "repository", "adapters/repository")
	generateFile(name, nameLower, "model", "adapters")
	generateFile(name, nameLower, "ports", "core")
}

func generateFile(name, nameLower, fileType, dir string) {
	var tmpl *template.Template
	var fileName string

	switch fileType {
	case "repository":
		tmpl = template.Must(template.New("repository").Parse(repositoryTemplate))
		fileName = fmt.Sprintf("%s_repository.go", nameLower)
	case "model":
		tmpl = template.Must(template.New("model").Parse(modelTemplate))
		fileName = fmt.Sprintf("gorm_%s_model.go", nameLower)
	case "ports":
		tmpl = template.Must(template.New("ports").Parse(portsTemplate))
		fileName = fmt.Sprintf("%s_ports.go", nameLower)
	}

	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		fmt.Printf("Error creating directory %s: %v\n", dir, err)
		return
	}

	filePath := filepath.Join(dir, fileName)
	file, err := os.Create(filePath)
	if err != nil {
		fmt.Printf("Error creating file %s: %v\n", filePath, err)
		return
	}
	defer file.Close()

	err = tmpl.Execute(file, struct {
		Name      string
		NameLower string
	}{
		Name:      name,
		NameLower: nameLower,
	})
	if err != nil {
		fmt.Printf("Error executing template for file %s: %v\n", filePath, err)
	}
}

const repositoryTemplate = `package repository

import (
   	"go-api/adapters"
	"go-api/core"

	"gorm.io/gorm"
)

type {{.Name}}Repository struct {
    DB *gorm.DB
}

func New{{.Name}}Repository(db *gorm.DB) *{{.Name}}Repository {
    return &{{.Name}}Repository{DB: db}
}

func (r *{{.Name}}Repository) Create{{.Name}}({{.Name}} *core.{{.Name}}) error {
    return r.DB.Create({{.Name}}).Error
}

func (r *{{.Name}}Repository) FindByID(id string) (*core.{{.Name}}, error) {
    var {{.Name}} core.{{.Name}}
    if err := r.DB.First(&{{.Name}}, "id = ?", id).Error; err != nil {
        return nil, err
    }
    return &{{.Name}}, nil
}
`

const modelTemplate = `package adapters

import (
    "gorm.io/gorm"
)

type {{.Name}} struct {
    gorm.Model
    Name string
}
`

const portsTemplate = `package core

type {{.Name}} struct {
    ID   string
    Name string
}

type {{.Name}}Service interface {
    Create{{.Name}}({{.Name}} {{.Name}}) ({{.Name}}, error)
    Get{{.Name}}ByID(id string) ({{.Name}}, error)
}

type {{.Name}}Repository interface {
    Create{{.Name}}({{.Name}} *{{.Name}}) error
    FindByID(id string) (*{{.Name}}, error)
}
`
