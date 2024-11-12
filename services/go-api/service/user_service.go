package service

import (
	"go-api/core"
)

// UserServiceImpl is an implementation of the UserService interface.
type UserServiceImpl struct {
	repo core.UserRepository
}

// NewUserService creates a new instance of UserServiceImpl.
func NewUserService(repo core.UserRepository) *UserServiceImpl {
	return &UserServiceImpl{repo: repo}
}

func (s *UserServiceImpl) CreateUser(user core.User) (core.User, error) {
	err := s.repo.Create(&user)
	if err != nil {
		return core.User{}, err
	}
	return user, nil
}

func (s *UserServiceImpl) GetUserByID(id string) (core.User, error) {
	user, err := s.repo.FindByID(id)

	if err != nil {
		return core.User{}, err
	}

	return user, nil
}
