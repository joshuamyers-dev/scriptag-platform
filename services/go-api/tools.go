//go:build tools

package tools

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/99designs/gqlgen/graphql/introspection"
	_ "github.com/dgrijalva/jwt-go"
	_ "github.com/go-chi/chi"
	_ "github.com/joho/godotenv"
	_ "github.com/pilagod/gorm-cursor-paginator/v2/paginator"
	_ "github.com/riverqueue/river"
	_ "github.com/riverqueue/river/riverdriver/riverpgxv5"
	_ "github.com/vikstrous/dataloadgen"
	_ "gorm.io/driver/postgres"
	_ "gorm.io/gorm"
)
