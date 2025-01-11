package mappers

import (
	adapters "go-api/adapters/models"
	"go-api/core"
	"go-api/graph/model"
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

func MapUserToCoreUser(gormUser *adapters.GormUser) *core.User {
	if gormUser == nil {
		return nil
	}

	var pushTokens []string
	for _, token := range gormUser.FCMTokens {
		if token != nil {
			pushTokens = append(pushTokens, token.Token)
		}
	}

	return &core.User{
		ID:         gormUser.ID,
		Email:      gormUser.Email,
		Password:   gormUser.Password,
		PushTokens: pushTokens,
	}
}
