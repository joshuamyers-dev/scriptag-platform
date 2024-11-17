package repository

import (
	"go-api/adapters"
	"go-api/core"

	"gorm.io/gorm"
)

type UserRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) core.UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) FindByID(id string) (*core.User, error) {
	var user adapters.GormUser
	if err := r.DB.Where("id = ?", id).First(&user).Error; err != nil {
		return &core.User{}, err
	}
	return &core.User{
		ID:    user.ID,
		Email: user.Email,
		Password: user.Password,
	}, nil
}

func (r *UserRepository) FindByEmail(email string) (*core.User, error) {
	var user adapters.GormUser
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return &core.User{}, err
	}
	return &core.User{
		ID:    user.ID,
		Email: user.Email,
	}, nil
}


func (r *UserRepository) Create(user *core.User) (*core.User, error) {
	gormUser := adapters.GormUser{
		Base: adapters.Base{
			ID: user.ID,
		},
		Email: user.Email,
		Password: user.Password,
	}

	if err := r.DB.Create(&gormUser).Error; err != nil {
		return &core.User{}, err
	}

	return &core.User{
		ID:    gormUser.ID,
		Email: gormUser.Email,
		Password: gormUser.Password,
	}, nil
}

func (r *UserRepository) AddFCMToken(user *core.User, token string) error {
	gormFcmToken := adapters.GormUserFCMToken{
		UserID: user.ID,
		Token:  token,
	}

	if err := r.DB.Create(&gormFcmToken).Error; err != nil {
		return err
	}

	return nil
}