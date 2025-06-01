package server

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/karthiknayak6/adaptive-coding-app/internal/models"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAllUsers retrieves all users with their profiles
func (s *Server) GetAllUsers(c echo.Context) error {
	collection := s.db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var users []models.User
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error retrieving users: " + err.Error(),
		})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &users); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error parsing users: " + err.Error(),
		})
	}

	// Sanitize password before sending
	for i := range users {
		users[i].Password = ""
	}

	return c.JSON(http.StatusOK, users)
}

// GetUserDetails retrieves a specific user's details including solved problems
func (s *Server) GetUserDetails(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "User ID is required",
		})
	}

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid user ID format",
		})
	}

	// Get user information
	collection := s.db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": "User not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error retrieving user: " + err.Error(),
		})
	}

	// Sanitize password
	user.Password = ""

	// Get detailed information about solved problems
	problemDetailsCollection := s.db.GetCollection("problem_details")
	var problemDetails []models.ProblemDetails
	cursor, err := problemDetailsCollection.Find(ctx, bson.M{"user_id": objID})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error retrieving problem details: " + err.Error(),
		})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &problemDetails); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error parsing problem details: " + err.Error(),
		})
	}

	// Create response with user and problem details
	response := map[string]interface{}{
		"user":            user,
		"problem_details": problemDetails,
	}

	return c.JSON(http.StatusOK, response)
}

// DeleteUser deletes a user from the system
func (s *Server) DeleteUser(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "User ID is required",
		})
	}

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid user ID format",
		})
	}

	// Delete user
	collection := s.db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error deleting user: " + err.Error(),
		})
	}

	if result.DeletedCount == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "User not found",
		})
	}

	// Also delete user's problem details
	problemDetailsCollection := s.db.GetCollection("problem_details")
	_, err = problemDetailsCollection.DeleteMany(ctx, bson.M{"user_id": objID})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error deleting user's problem details: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "User deleted successfully",
	})
}

// AddProblem adds a new problem to the problems collection
func (s *Server) AddProblem(c echo.Context) error {
	var problem models.Problem
	if err := c.Bind(&problem); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid problem data: " + err.Error(),
		})
	}

	// Connect to the problems collection
	collection := s.db.GetCollection("problems")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find the highest problem ID
	var highestProblem models.Problem
	opts := options.FindOne().SetSort(bson.D{{Key: "id", Value: -1}})
	err := collection.FindOne(ctx, bson.M{}, opts).Decode(&highestProblem)
	if err != nil && err != mongo.ErrNoDocuments {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error finding highest problem ID: " + err.Error(),
		})
	}

	// Set new ID (use the highest ID + 1 or start at 1 if no problems exist)
	if err == mongo.ErrNoDocuments {
		problem.ID = 1
	} else {
		problem.ID = highestProblem.ID + 1
	}

	// Insert the new problem into the database
	_, err = collection.InsertOne(ctx, problem)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error adding problem to database: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, problem)
}

// DeleteProblem deletes a problem by ID
func (s *Server) DeleteProblem(c echo.Context) error {
	problemID := c.Param("id")
	if problemID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Problem ID is required",
		})
	}

	// Convert string ID to int
	id, err := strconv.Atoi(problemID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid problem ID format",
		})
	}

	// Connect to the problems collection
	collection := s.db.GetCollection("problems")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete the problem
	result, err := collection.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error deleting problem: " + err.Error(),
		})
	}

	if result.DeletedCount == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Problem not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Problem deleted successfully",
	})
}

// GetAllProblems retrieves all problems
func (s *Server) GetAllProblems(c echo.Context) error {
	// Connect to the problems collection
	collection := s.db.GetCollection("problems")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all problems
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error retrieving problems: " + err.Error(),
		})
	}
	defer cursor.Close(ctx)

	// Decode problems
	var problems []models.Problem
	if err = cursor.All(ctx, &problems); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error parsing problems: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, problems)
} 