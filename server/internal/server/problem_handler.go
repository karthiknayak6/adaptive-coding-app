package server

import (
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
	TestCaseID int         				`bson:"testcaseid"`
	Input      map[string]interface{} 	`bson:"input"`
	Output     interface{} 				`bson:"output"`
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
	UserTime   float64 `json:"userTime"`
}

type TestCaseResponse struct {
	TestCaseID 		int    `json:"testcaseid"`
	Passed     		bool   `json:"passed"`
	ActualOutput 	string `json:"actualOutput"`
	ExpectedOutput 	string `json:"expectedOutput"`
	Error           string `json:"error,omitempty"`
}

// SubmissionResponse represents the response payload for a submission
type SubmissionResponse struct {
	ProblemID      		string              `json:"problemId"`
	Passed         		bool                `json:"passed"`
	Tests          		[]TestCaseResponse  `json:"tests"`
	TotalTimeTaken  	time.Duration       `json:"totalTimeTaken"`
	TotalMemoryUsed 	int64             	`json:"totalMemoryUsed"`
}
// Server represents the server structure


func (s *Server) ValidateSubmission(c echo.Context) error {
	var req SubmissionRequest
	var res SubmissionResponse

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

	// Start measuring time and memory
	startTime := time.Now()
	var memStart, memEnd syscall.Rusage

	if err := syscall.Getrusage(syscall.RUSAGE_SELF, &memStart); err != nil {
		log.Println("Failed to get initial memory usage:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get initial memory usage"})
	}

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

		outputStr := strings.TrimSpace(string(output))
		if err != nil {
			log.Printf("Error executing command: %s, Output: %s", err, output)
			res.Tests = append(res.Tests, TestCaseResponse{
				TestCaseID:      testCase.TestCaseID,
				Passed:          false,
				ActualOutput:    outputStr,
				ExpectedOutput:  fmt.Sprint(testCase.Output),
				Error:           err.Error(),
			})
			continue
		}

		// Print the output
		fmt.Printf("Output: %s\n", outputStr)

		// Convert expected output to string for comparison
		expectedOutput := fmt.Sprint(testCase.Output) // Convert to string
		expectedOutput = strings.Trim(expectedOutput, "[]") // Remove square brackets
		expectedOutput = strings.ReplaceAll(expectedOutput, ",", "") // Remove commas

		// Normalize actual output
		actualOutput := strings.Trim(outputStr, "[]") // Remove square brackets
		actualOutput = strings.ReplaceAll(actualOutput, ",", "") // Remove commas

		res.Tests = append(res.Tests, TestCaseResponse{
			TestCaseID:      testCase.TestCaseID,
			Passed:          actualOutput == expectedOutput,
			ActualOutput:    actualOutput,
			ExpectedOutput:  expectedOutput,
		})

		if actualOutput == expectedOutput {
			fmt.Println("Test case passed")
			fmt.Printf("Expected Output: [%s], Actual Output: [%s]\n", expectedOutput, actualOutput)
		} else {
			fmt.Println("Test case failed")
			fmt.Printf("Expected Output: [%s], Actual Output: [%s]\n", expectedOutput, actualOutput)
		}
	}

	// End measuring time and memory
	totalTimeTaken := time.Since(startTime)
	milliseconds := totalTimeTaken.Milliseconds()
	if err := syscall.Getrusage(syscall.RUSAGE_SELF, &memEnd); err != nil {
		log.Println("Failed to get final memory usage:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get final memory usage"})
	}

	totalMemoryUsed := memEnd.Maxrss - memStart.Maxrss

	res.ProblemID = req.ProblemID
	res.TotalTimeTaken = time.Duration(milliseconds)
	res.TotalMemoryUsed = totalMemoryUsed

	totalPassedCases := 0
	for _, testCase := range res.Tests {
		if testCase.Passed {
			totalPassedCases++
		}
	}
	if totalPassedCases == len(res.Tests) {
		res.Passed = true
	}
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"username": c.Get("username")}).Decode(&user)
	if err != nil {
		log.Println("Failed to find user:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find user"})
	}
	var problemDetails models.ProblemDetails

	problemDetails.ProblemID = problem.ID
	problemDetails.UserID = user.ID
	problemDetails.SolvedAt = time.Now()
	problemDetails.TimeTaken = req.UserTime
	problemDetails.Runtime = float64(totalTimeTaken)
	problemDetails.DifficultyLevel = problem.Difficulty


	collection = s.db.GetCollection("problem_details")
	_, err = collection.InsertOne(context.Background(), problemDetails)
	if err != nil {
		log.Println("Failed to insert problem details:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert problem details"})
	}

	level, err := predictUserLevel(problem.Difficulty, req.UserTime, float64(totalTimeTaken))
	lvmap := map[string]string{"Beginner": "Easy", "Intermediate": "Medium", "Expert": "Hard"}

	fmt.Println("Predicted Level: ", level)

	fmt.Println("Predicted Level: ", lvmap[level])
	if err != nil {
		log.Println("Failed to predict user level:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to predict user level"})
	}



	return c.JSON(http.StatusOK, res)
}


type AcceptUserSubmissionRequest struct {
	ProblemID string `json:"problemId"`
	Submission string `json:"submission"`
	TimeTaken float64 `json:"timeTaken"`
	RunTime   float64 `json:"runTime"`
}

// func (s *Server) AcceptUserSubmission(c echo.Context) error {

// 	var req AcceptUserSubmissionRequest
// 	if err := c.Bind(&req); err != nil {
// 		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
// 	}

// 	collection := s.db.GetCollection("users")
// 	var user models.User
// 	err := collection.FindOne(context.Background(), bson.M{"username": c.Get("username")}).Decode(&user)
// 	if err != nil {
// 		log.Println("Failed to find user:", err)
// 		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find user"})
// 	}

// 	collection = s.db.GetCollection("problems")
// 	var problem models.Problem
// 	err = collection.FindOne(context.Background(), bson.M{"id": req.ProblemID}).Decode(&problem)
// 	if err != nil {
// 		log.Println("Failed to find problem:", err)
// 		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find problem"})
// 	}
// 	var problemDetails models.ProblemDetails

// 	problemDetails.ProblemID = problem.ID
// 	problemDetails.UserID = user.ID
// 	problemDetails.SolvedAt = time.Now()
// 	problemDetails.TimeTaken = req.TimeTaken
// 	problemDetails.Runtime = req.RunTime
// 	problemDetails.DifficultyLevel = problem.Difficulty


// 	collection = s.db.GetCollection("problem_details")
// 	_, err = collection.InsertOne(context.Background(), problemDetails)
// 	if err != nil {
// 		log.Println("Failed to insert problem details:", err)
// 		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert problem details"})
// 	}

	


// 	return c.JSON(http.StatusOK, user)
	
// }

func predictUserLevel(difficulty string, timeTaken float64, runtime float64) (string,error) {
	fmt.Println("Function call")

	// Prepare the command
	cmd := exec.Command("python3", "/home/karthik/adaptive-coding-app/server/internal/scripts/predict_level.py", fmt.Sprintf("%f", timeTaken), fmt.Sprintf("%f", runtime))

	// Run the command and capture the output
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Failed to execute command: %s\nError: %v\nOutput: %s", cmd.String(), err, string(output))
		return "", err
	}

	// Print the predicted level and difficulty
	fmt.Printf("Predicted Level: %s", string(output))
	fmt.Println("difficulty: ", difficulty)

	return string(output), nil
}


// package models

// import "go.mongodb.org/mongo-driver/bson/primitive"

// type TestCase struct {
// 	TestCaseID int         `json:"test_case_id" bson:"test_case_id"`
// 	Input      interface{} `json:"input" bson:"input"`
// 	Output     interface{} `json:"output" bson:"output"`
// }

// type Problem struct {
// 	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
// 	Title       string             `json:"title" bson:"title"`
// 	Description string             `json:"description" bson:"description"`
// 	Boilerplate string             `json:"boilerplate" bson:"boilerplate"`
// 	Difficulty  string             `json:"difficulty" bson:"difficulty"`
// 	TestCases   []TestCase         `json:"test_cases" bson:"test_cases"`
// }

// type ProblemsFile struct {
// 	Problems []Problem `json:"problems" bson:"problems"`
// }
