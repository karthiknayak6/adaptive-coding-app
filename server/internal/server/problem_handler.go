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
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/karthiknayak6/adaptive-coding-app/internal/models"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
)

func (s *Server) updateProblems(c echo.Context) error {
	file, err := os.Open("/home/karthik/adaptive-coding-app/server/problem.json")
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


func (s *Server) SuggestProblem(c echo.Context) error {

	problemId := c.Param("problemId")


	collection := s.db.GetCollection("problems")
	var problem models.Problem
	fmt.Println(problemId)
	problemId_int, err := strconv.ParseInt(problemId, 10, 64)
	if err != nil {
		log.Println("Failed to parse problem ID:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse problem ID"})
	}
	err = collection.FindOne(context.Background(), bson.M{"id": problemId_int}).Decode(&problem)
	if err != nil {
		log.Println("Failed to find problem:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find problem"})
	}


	return c.JSON(http.StatusOK, problem)

}




// KeyValue represents the input key-value pairs for a test case.
type KeyValue struct {
	Key   string      `bson:"Key"`
	Value interface{} `bson:"Value"`
}

// TestCase represents a test case for a problem
type TestCase struct {
	TestCaseID int         `bson:"testcaseid"`
	Input      map[string]interface{} `bson:"input"`
	Output     interface{} `bson:"output"`
}

// Problem represents a problem document in MongoDB
type Problem struct {
	ID          int        `bson:"id"`
	Title       string     `bson:"title"`
	Description string     `bson:"description"`
	Difficulty  string     `bson:"difficulty"`
	TestCases   []TestCase `bson:"testcases"`
}

// SubmissionRequest represents the request payload for a submission
type SubmissionRequest struct {
	ProblemID  string `json:"problemId"`
	Submission string `json:"submission"`
}

// SubmissionResponse represents the response payload for a submission
type SubmissionResponse struct {
	Passed bool   `json:"passed"`
	Error  string `json:"error,omitempty"`
}
// Server represents the server structure


func (s *Server) ValidateSubmission(c echo.Context) error {
	var req SubmissionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	if req.ProblemID == "" || req.Submission == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Problem ID and submission are required"})
	}

	fmt.Println("\n\nreq.ProblemID:", req.ProblemID)

	tmpDir := os.TempDir()
	pythonCodeFile := filepath.Join(tmpDir, "submission.py")

	err := os.WriteFile(pythonCodeFile, []byte(req.Submission), 0644)
	if err != nil {
		log.Println("Failed to write code to file:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to write code to file"})
	}

	collection := s.db.GetCollection("problems")
	var problem Problem
	problemIDInt, err := strconv.ParseInt(req.ProblemID, 10, 64)
	if err != nil {
		log.Println("Failed to parse problem ID:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse problem ID"})
	}

	err = collection.FindOne(c.Request().Context(), bson.M{"id": problemIDInt}).Decode(&problem)
	if err != nil {
		log.Println("Failed to find problem:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find problem"})
	}
	fmt.Println("Testcases", problem.TestCases)

	for _, testCase := range problem.TestCases {
		fmt.Println("\n\nTestCase Input:", testCase.Input)
		for key, value := range testCase.Input {
			fmt.Printf("Key: %s, Value: %v\n", key, value)
		}

		// Convert inputs to the required format for the Python script
		inputValues := []string{}
		for _, value := range testCase.Input {
			switch v := value.(type) {
			case []interface{}:
				// Convert []interface{} to a single string of comma-separated values
				strValues := make([]string, len(v))
				for i, val := range v {
					strValues[i] = fmt.Sprint(val)
				}
				inputValues = append(inputValues, strings.Join(strValues, ","))
			default:
				inputValues = append(inputValues, fmt.Sprint(v))
			}
		}

		// Pass the arguments correctly to the Python script
		fmt.Println("\n\ninputValues:", append([]string{pythonCodeFile}, inputValues...))
		cmd := exec.Command("python3", append([]string{pythonCodeFile}, inputValues...)...)
		output, err := cmd.CombinedOutput() // Use CombinedOutput to capture stdout and stderr
		if err != nil {
			log.Printf("Error executing command: %s, Output: %s", err, output)
			continue // Skip this test case
		}

		// Print the output
		outputStr := strings.TrimSpace(string(output))
		fmt.Printf("Output: %s\n", outputStr)

		// Convert expected output to string for comparison
		expectedOutput := fmt.Sprint(testCase.Output) // Convert to string
		expectedOutput = strings.Trim(expectedOutput, "[]") // Remove square brackets
		expectedOutput = strings.ReplaceAll(expectedOutput, ",", "") // Remove commas

		// Normalize actual output
		actualOutput := strings.Trim(outputStr, "[]") // Remove square brackets
		actualOutput = strings.ReplaceAll(actualOutput, ",", "") // Remove commas

		if actualOutput == expectedOutput {
			fmt.Println("Test case passed")
		} else {
			fmt.Println("Test case failed")
			fmt.Printf("Expected Output: [%s], Actual Output: [%s]\n", expectedOutput, actualOutput)
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Validation successful"})
}
