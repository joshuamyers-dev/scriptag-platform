package auth

import (
	"context"
	"go-api/core"
	"go-api/service"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

func Middleware(userService *service.UserServiceImpl) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			parts := strings.Split(authHeader, "Bearer ")
			if len(parts) != 2 || parts[0] != "" {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			token := parts[1]

			jwtToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
				return []byte(os.Getenv("SECRET_KEY")), nil
			})

			if err != nil || !jwtToken.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := jwtToken.Claims.(jwt.MapClaims)
			if !ok || !jwtToken.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			userId, ok := claims["user_id"].(string)
			if !ok {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			user, err := userService.GetUserByID(userId)

			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
			}

			ctx := context.WithValue(r.Context(), userCtxKey, &user)

			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

func ForContext(ctx context.Context) *core.User {
	raw, _ := ctx.Value(userCtxKey).(*core.User)
	return raw
}
