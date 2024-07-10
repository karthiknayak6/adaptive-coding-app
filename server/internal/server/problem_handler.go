package server

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"time"

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



type CodeRequest struct {
	Code string `json:"code"`
}

func setResourceLimits() error {
	// Limit CPU time to 1 second
	if err := syscall.Setrlimit(syscall.RLIMIT_CPU, &syscall.Rlimit{Cur: 1, Max: 1}); err != nil {
		return fmt.Errorf("failed to set CPU limit: %v", err)
	}
	// Limit memory usage to 100 MB (or a higher value if necessary)
	if err := syscall.Setrlimit(syscall.RLIMIT_AS, &syscall.Rlimit{Cur: 100 * 1024 * 1024, Max: 100 * 1024 * 1024}); err != nil {
		return fmt.Errorf("failed to set memory limit: %v", err)
	}
	return nil
}

func (s *Server) ExecuteHandler(c echo.Context) error {
	// Parse the JSON request body
	var req CodeRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "Invalid request")
	}

	// Save the C code to a temporary file
	tmpDir := os.TempDir()
	sourceFile := filepath.Join(tmpDir, "user_code.c")
	executable := filepath.Join(tmpDir, "user_code.out")
	err := os.WriteFile(sourceFile, []byte(req.Code), 0644)
	if err != nil {
		return c.String(500, fmt.Sprintf("Failed to write code to file: %v", err))
	}

	// Compile the C code using gcc
	cmd := exec.Command("gcc", sourceFile, "-o", executable)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		return c.String(500, fmt.Sprintf("Compilation error: %s", stderr.String()))
	}

	// Set resource limits
	if err := setResourceLimits(); err != nil {
		return c.String(500, fmt.Sprintf("Failed to set resource limits: %v", err))
	}

	// Run the executable with a timeout
	cmd = exec.Command(executable)
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	done := make(chan error)
	go func() {
		done <- cmd.Run()
	}()

	select {
	case <-time.After(1 * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			fmt.Printf("failed to kill: %v\n", err)
		}
		return c.String(500, "Execution timed out")
	case err := <-done:
		if err != nil {
			return c.String(500, fmt.Sprintf("Runtime error: %s", stderr.String()))
		}
		return c.String(200, stdout.String())
	}
}


