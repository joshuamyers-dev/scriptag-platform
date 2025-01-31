//go:build tools

package tools

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/99designs/gqlgen/graphql/introspection"
	_ "github.com/go-jet/jet/v2"
	_ "github.com/golang-jwt/jwt"
	_ "github.com/joho/godotenv"
	_ "github.com/lib/pq"
	_ "github.com/pilagod/gorm-cursor-paginator/v2/paginator"
	_ "github.com/riverqueue/river"
	_ "github.com/riverqueue/river/riverdriver/riverpgxv5"
	_ "github.com/robfig/cron/v3"
	_ "github.com/vikstrous/dataloadgen"
	_ "golang.org/x/crypto/bcrypt"
	_ "gorm.io/driver/postgres"
	_ "gorm.io/gorm"
)
