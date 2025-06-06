package middlewares

import (
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
        
        // Convert user ID from string to ObjectID and set it directly in context
        if claims.UserID != "" {
            objID, err := primitive.ObjectIDFromHex(claims.UserID)
            if err == nil {
                c.Set("user_id", objID)
            }
        }
        
        return next(c)
    }
}