package core

type User struct {
	ID    string
	Email string
}

type UserService interface {
	CreateUser(user User) (User, error)
}

// UserRepository defines the output port for interacting with the database.
type UserRepository interface {
	FindByID(id string) (User, error)
	Create(user *User) error
}
