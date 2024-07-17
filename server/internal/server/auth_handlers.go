package server

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/karthiknayak6/adaptive-coding-app/internal/models"
	"github.com/karthiknayak6/adaptive-coding-app/internal/utils"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)


type JWTClaims struct {
    UserID   string `json:"user_id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    jwt.StandardClaims
}


func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
		jwtSecret := os.Getenv("JWT_SECRET")
        authHeader := c.Request().Header.Get("Authorization")
        if authHeader == "" {
            return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing or invalid token"})
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        claims := new(JWTClaims)

        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
            return []byte(jwtSecret), nil
        })

        if err != nil || !token.Valid {
            return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
        }

        c.Set("user", claims)
        return next(c)
    }
}

func (s *Server) RegisterHandler(c echo.Context) error {
	user := new(models.User)
	if err := c.Bind(user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	// Validate user input
	if user.Username == "" || user.Email == "" || user.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Username, email, and password are required"})
	}

	// Check if user already exists
	collection := s.db.GetCollection("users")
	existingUser := new(models.User)
	err := collection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(existingUser)
	if err != mongo.ErrNoDocuments {
		return c.JSON(http.StatusConflict, map[string]string{"error": "User with this email already exists"})
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to hash password"})
	}
	user.Password = string(hashedPassword)

	// Set creation time
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	// Insert the user into the database
	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	// Get the inserted ID and convert it to ObjectID
	insertedID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get user ID"})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(insertedID, user.Username, user.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "User registered successfully",
		"token":   token,
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (s *Server) LoginHandler(c echo.Context) error {
	// Bind the request body to LoginRequest struct
	var loginReq LoginRequest
	if err := c.Bind(&loginReq); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	// Validate input
	if loginReq.Email == "" || loginReq.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Email and password are required"})
	}

	// Fetch user from database
	collection := s.db.GetCollection("users")
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"email": loginReq.Email}).Decode(&user)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	// Check password	
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	// Return the token
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Login successful",
		"token":   token,
	})
}
