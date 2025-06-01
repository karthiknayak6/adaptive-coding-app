package server

import (
	"net/http"

	"github.com/karthiknayak6/adaptive-coding-app/middlewares"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (s *Server) RegisterRoutes() http.Handler {
	e := echo.New()

	// CORS Configuration
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:8000",
		},
		AllowMethods: []string{
			echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE,
		},
	}))

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Public Routes
	e.GET("/health", s.healthHandler)
	e.POST("/register", s.RegisterHandler)
	e.POST("/login", s.LoginHandler)
	e.GET("/update", s.updateProblems)

	// Protected API Routes
	r := e.Group("/api")
	r.Use(middlewares.AuthMiddleware)

	r.GET("/profile", s.ProfileHandler)  // Fetch user profile & solved problems
	r.GET("/suggest/:problemId", s.SuggestProblem)
	r.POST("/submission", s.ValidateSubmission)
	
	// Admin Routes
	admin := e.Group("/admin")
	admin.Use(middlewares.AuthMiddleware)
	// Future enhancement: Add role-based middleware to check if user is admin
	
	// User management
	admin.GET("/users", s.GetAllUsers)
	admin.GET("/users/:id", s.GetUserDetails)
	admin.DELETE("/users/:id", s.DeleteUser)
	
	// Problem management
	admin.GET("/problems", s.GetAllProblems)
	admin.POST("/problems", s.AddProblem)
	admin.DELETE("/problems/:id", s.DeleteProblem)

	return e
}

func (s *Server) healthHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, s.db.Health())
}
