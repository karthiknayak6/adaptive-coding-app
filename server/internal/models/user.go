package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	FirstName string             `bson:"first_name" json:"first_name"`
	LastName  string             `bson:"last_name" json:"last_name"`
	Username  string             `bson:"username" json:"username"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"password"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`

}

type ProblemDetails struct {
    ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
    ProblemID       int `bson:"problem_id" json:"problem_id"`
    SolvedAt        time.Time          `bson:"solved_at" json:"solved_at"`
    TimeTaken       float64            `bson:"time_taken" json:"time_taken"`
    Runtime         float64            `bson:"runtime" json:"runtime"`
    DifficultyLevel string             `bson:"difficulty_level" json:"difficulty_level"`
}