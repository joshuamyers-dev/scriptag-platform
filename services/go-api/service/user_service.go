package service

import (
	"context"
	"go-api/adapters/mappers"
	"go-api/core"
	"go-api/graph/model"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type UserServiceImpl struct {
	repo core.UserRepository
}

func NewUserService(repo core.UserRepository) *UserServiceImpl {
	return &UserServiceImpl{repo: repo}
}

func (s *UserServiceImpl) CreateUser(context context.Context, user *core.User) (*model.Session, error) {
	existingUser, err := s.repo.FindByEmail(user.Email)

	if err != nil && err.Error() != "record not found" || existingUser.ID != "" {
		graphql.AddErrorf(context, "This email is already in use. Please use a different email.")
		return &model.Session{}, nil
	}

	bytes, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)

	if err != nil {
		return &model.Session{}, err
	}

	user.Password = string(bytes)

	user, err = s.repo.Create(user)

	if err != nil {
		return &model.Session{}, err
	}

	tokenClaims := &jwt.MapClaims{
		"user_id": user.ID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))

	if err != nil {
		return &model.Session{}, err
	}

	return &model.Session{
        Token: &tokenString,
        User:  mappers.MapCoreUserToGraphQL(user),
    }, nil
}

func (s *UserServiceImpl) LoginUser(context context.Context, email string, password string) (*model.Session, error) {
	user, err := s.repo.FindByEmail(email)

	if err != nil {
		graphql.AddErrorf(context, "Invalid email or password.")
		return &model.Session{}, nil
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))

	if err != nil {
		graphql.AddErrorf(context, "Invalid email or password.")
		return &model.Session{}, nil
	}

	tokenClaims := &jwt.MapClaims{
		"user_id": user.ID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))

	if err != nil {
		return &model.Session{}, err
	}

	return &model.Session{
        Token: &tokenString,
        User:  mappers.MapCoreUserToGraphQL(user),
    }, nil
}

func (s *UserServiceImpl) GetUserByID(id string) (*core.User, error) {
	user, err := s.repo.FindByID(id)

	if err != nil {
		return &core.User{}, err
	}

	return user, nil
}

func (s *UserServiceImpl) AddFCMToken(context context.Context, user *core.User, token string) error {
	err := s.repo.AddFCMToken(user, token)

	if err != nil {
		return err
	}

	return nil
}
