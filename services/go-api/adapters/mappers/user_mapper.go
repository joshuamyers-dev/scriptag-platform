package mappers

import (
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/core"
	"github.com/joshnissenbaum/scriptag-platform/services/go-api/graph/model"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
)

func MapCoreUserToGraphQL(coreUser *core.User) *model.User {
	if coreUser == nil {
		return nil
	}

	return &model.User{
		ID:    coreUser.ID,
		Email: coreUser.Email,
	}
}

func MapCoreSessionToGraphQL(coreSession *core.Session) *model.Session {
	if coreSession == nil {
		return nil
	}

	return &model.Session{
		Token: &coreSession.Token,
		User:  MapCoreUserToGraphQL(&coreSession.User),
	}
}

func MapUserToCoreUser(gormUser *models.User) *core.User {
	if gormUser == nil {
		return nil
	}

	var pushTokens []string
	for _, token := range gormUser.FCMTokens {
		pushTokens = append(pushTokens, token.Token)
	}

	return &core.User{
		ID:         gormUser.ID,
		Email:      gormUser.Email,
		Password:   gormUser.Password,
		PushTokens: pushTokens,
		TimeZone:   gormUser.TimeZone,
	}
}
