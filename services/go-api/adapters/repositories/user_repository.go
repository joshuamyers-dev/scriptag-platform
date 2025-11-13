package repository

import (
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/adapters/mappers"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/db"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	DB    *gorm.DB
	Query *db.Query
}

func NewUserRepository(gormDB *gorm.DB) *UserRepository {
	return &UserRepository{
		DB:    gormDB,
		Query: db.Use(gormDB),
	}
}

func (r *UserRepository) FindByID(id string) (*core.User, error) {
	user, err := r.Query.User.Where(r.Query.User.ID.Eq(id)).First()

	if err != nil {
		return &core.User{}, err
	}

	return mappers.MapUserToCoreUser(user), nil
}

func (r *UserRepository) FindByEmail(email string) (*core.User, error) {
	user, err := r.Query.User.Where(r.Query.User.Email.Eq(email)).First()

	if err != nil {
		return &core.User{}, err
	}

	return mappers.MapUserToCoreUser(user), nil
}

func (r *UserRepository) Create(user *core.User) (*core.User, error) {
	gormUser := models.User{
		Base: models.Base{
			ID: user.ID,
		},
		Email:    user.Email,
		Password: user.Password,
	}

	if err := r.DB.Create(&gormUser).Error; err != nil {
		return &core.User{}, err
	}

	return mappers.MapUserToCoreUser(&gormUser), nil
}

func (r *UserRepository) AddFCMToken(user *core.User, token string) error {
	fcmToken := models.UserFCMToken{
		UserID: user.ID,
		Token:  token,
	}

	if err := r.DB.Create(&fcmToken).Error; err != nil {
		return err
	}

	return nil
}
