package core

import (
	"context"
	"go-api/graph/model"
)

type User struct {
	ID    string
	Email string
	Password string
}

type Session struct {
	Token string
	User User
}

type UserService interface {
	CreateUser(context context.Context, user *User) (*model.Session, error)
	AddFCMToken(context context.Context, user *User, token string) error
}

type UserRepository interface {
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	Create(user *User) (*User, error)
	AddFCMToken(user *User, token string) error
}
