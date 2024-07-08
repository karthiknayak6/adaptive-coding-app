package server

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/karthiknayak6/adaptive-coding-app/internal/models"
	"github.com/labstack/echo/v4"
)

func (s *Server) updateProblems(c echo.Context) error {
	file, err := os.Open("/home/karthik/adaptive-coding-app/server/problems.json")
	if err != nil {
		log.Println("Cannot open problems.json file:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Cannot open problems.json file"})
	}
	defer file.Close()

	b, err := io.ReadAll(file)
	if err != nil {
		log.Println("Cannot read problems.json file:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Cannot read problems.json file"})
	}

	var problemsFile models.ProblemsFile

	err = json.Unmarshal(b, &problemsFile)
	if err != nil {
		log.Println("Failed to unmarshal JSON:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse JSON"})
	}

	if len(problemsFile.Problems) == 0 {
		log.Println("No problems found in the JSON file")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "No problems found in the JSON file"})
	}

	var problemsInterface []interface{}
	for _, p := range problemsFile.Problems {
		problemsInterface = append(problemsInterface, p)
	}

	collection := s.db.GetCollection("problems")
	ctx := context.Background()
	_, err = collection.InsertMany(ctx, problemsInterface)
	if err != nil {
		log.Println("Failed to insert problems into database:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert problems into database"})
	}

	return c.JSON(http.StatusAccepted, map[string]string{"msg": "success"})
}
