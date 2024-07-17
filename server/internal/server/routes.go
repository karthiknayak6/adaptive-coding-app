package server

import (
	"net/http"

	"github.com/karthiknayak6/adaptive-coding-app/middlewares"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (s *Server) RegisterRoutes() http.Handler {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000", "http://127.0.0.1:8000"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.GET("/health", s.healthHandler)
	e.POST("/register", s.RegisterHandler)
	e.POST("/login", s.LoginHandler)
	e.GET("/update", s.updateProblems)
	
	r := e.Group("/api")
	r.Use(middlewares.AuthMiddleware) 
	
	r.GET("/suggest/:problemId", s.SuggestProblem)
	r.POST("/submission", s.ValidateSubmission)

	return e
}

func (s *Server) healthHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, s.db.Health())
}
