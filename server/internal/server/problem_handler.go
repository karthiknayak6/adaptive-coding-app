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

func (s *Server) ProfileHandler(c echo.Context) error {
	// Extract user ID from the middleware (it's now directly stored in the context)
	userID := c.Get("user_id")
	fmt.Println("userID", userID)
	if userID == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}

	// Fetch user details from the database
	var user models.User
	collection := s.db.GetCollection("users")
	ctx := context.Background()

	err := collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "User not found"})
	}

	// Fetch solved problems by user ID
	problemCollection := s.db.GetCollection("problem_details")
	cursor, err := problemCollection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		log.Println("Failed to fetch solved problems:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch solved problems"})
	}
	defer cursor.Close(ctx)

	var solvedProblems []models.ProblemDetails
	for cursor.Next(ctx) {
		var problem models.ProblemDetails
		if err := cursor.Decode(&problem); err != nil {
			log.Println("Failed to decode problem details:", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse problem details"})
		}
		solvedProblems = append(solvedProblems, problem)
	}

	log.Printf("Found %d solved problems for user %s", len(solvedProblems), userID)

	// Response JSON
	response := map[string]interface{}{
		"user":            user,
		"solved_problems": solvedProblems,
	}

	fmt.Println("response", response)

	return c.JSON(http.StatusOK, response)
}

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
	TestCaseID int                    `bson:"testcaseid"`
	Input      map[string]interface{} `bson:"input"`
	Output     interface{}            `bson:"output"`
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
	ProblemID  string  `json:"problemId"`
	Submission string  `json:"submission"`
	UserTime   float64 `json:"userTime"`
}

type TestCaseResponse struct {
	TestCaseID     int    `json:"testcaseid"`
	Passed         bool   `json:"passed"`
	ActualOutput   string `json:"actualOutput"`
	ExpectedOutput string `json:"expectedOutput"`
	Error          string `json:"error,omitempty"`
}

// SubmissionResponse represents the response payload for a submission
type SubmissionResponse struct {
	ProblemID       string             `json:"problemId"`
	Passed          bool               `json:"passed"`
	Tests           []TestCaseResponse `json:"tests"`
	TotalTimeTaken  time.Duration      `json:"totalTimeTaken"`
	TotalMemoryUsed int64              `json:"totalMemoryUsed"`
	NextProblemId   int                `json:"nextProblemId"`
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
				TestCaseID:     testCase.TestCaseID,
				Passed:         false,
				ActualOutput:   outputStr,
				ExpectedOutput: fmt.Sprint(testCase.Output),
				Error:          err.Error(),
			})
			continue
		}


		// Convert expected output to string for comparison
		expectedOutput := fmt.Sprint(testCase.Output)                // Convert to string
		expectedOutput = strings.Trim(expectedOutput, "[]")          // Remove square brackets
		expectedOutput = strings.ReplaceAll(expectedOutput, ",", "") // Remove commas

		// Normalize actual output
		actualOutput := strings.Trim(outputStr, "[]")            // Remove square brackets
		actualOutput = strings.ReplaceAll(actualOutput, ",", "") // Remove commas

		res.Tests = append(res.Tests, TestCaseResponse{
			TestCaseID:     testCase.TestCaseID,
			Passed:         actualOutput == expectedOutput,
			ActualOutput:   actualOutput,
			ExpectedOutput: expectedOutput,
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
	
	// Get the user information
	usersCollection := s.db.GetCollection("users")
	var user models.User
	
	// Get the user ID directly from the context
	userId := c.Get("user_id")
	fmt.Println("userId", userId)
	if userId == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized: User not found in context"})
	}
	
	err = usersCollection.FindOne(context.Background(), bson.M{"_id": userId}).Decode(&user)
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

	// Save the problem details
	problemDetailsCollection := s.db.GetCollection("problem_details")
	_, err = problemDetailsCollection.InsertOne(context.Background(), problemDetails)
	if err != nil {
		log.Println("Failed to insert problem details:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert problem details"})
	}

	// If the problem was successfully solved, add it to the user's solved_problems array
	if res.Passed {
		// Check if the problem is already in the user's solved_problems array
		problemAlreadySolved := false
		
		// If solved_problems is nil, it means we need to initialize it
		if user.SolvedProblems == nil {
			// Initialize with the current problem only
			log.Printf("Initializing solved_problems array for user %s with problem ID %d", user.ID.Hex(), problem.ID)
			_, err = usersCollection.UpdateOne(
				context.Background(),
				bson.M{"_id": user.ID},
				bson.M{"$set": bson.M{"solved_problems": []int64{int64(problem.ID)}}},
			)
			if err != nil {
				log.Println("Failed to initialize user's solved problems:", err)
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to initialize user's solved problems"})
			}
			log.Printf("Successfully initialized solved_problems for user %s with problem %d", user.ID.Hex(), problem.ID)
		} else {
			// Check if problem is already in the array
			for _, solvedProblemID := range user.SolvedProblems {
				if solvedProblemID == int64(problem.ID) {
					problemAlreadySolved = true
					break
				}
			}

			// If problem isn't already marked as solved, add it to the user's solved_problems array
			if !problemAlreadySolved {
				// Update user's solved_problems array
				_, err = usersCollection.UpdateOne(
					context.Background(),
					bson.M{"_id": user.ID},
					bson.M{"$push": bson.M{"solved_problems": int64(problem.ID)}},
				)
				if err != nil {
					log.Println("Failed to update user's solved problems:", err)
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update user's solved problems"})
				}
				log.Printf("Added problem %d to user's solved problems", problem.ID)
			}
		}
	}

	level, err := predictUserLevel(problem.Difficulty, req.UserTime, float64(totalTimeTaken))

	fmt.Println("LEVEL: ", level)

	if err != nil {
		log.Println("Failed to predict user level:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to predict user level"})
	}

	if level == "Beginner" {
		res.NextProblemId = problem.ID + 1
	} else if level == "Intermediate" {
		res.NextProblemId = problem.ID + 2
	} else if level == "Expert" {
		res.NextProblemId = problem.ID + 3
	}

	return c.JSON(http.StatusOK, res)
}

type AcceptUserSubmissionRequest struct {
	ProblemID  string  `json:"problemId"`
	Submission string  `json:"submission"`
	TimeTaken  float64 `json:"timeTaken"`
	RunTime    float64 `json:"runTime"`
}

func predictUserLevel(difficulty string, timeTaken float64, runtime float64) (string, error) {
	fmt.Println("Function call")
	fmt.Println("time taken", timeTaken)
	fmt.Println("runtime", runtime)

	timeTaken = timeTaken / 60000
	runtime = runtime / 1000000

	fmt.Println("time taken", timeTaken)
	fmt.Println("runtime", runtime)

	// Prepare the command
	cmd := exec.Command("/home/karthik/adaptive-coding-app/server/internal/scripts/env/bin/python3",
		"/home/karthik/adaptive-coding-app/server/internal/scripts/predict_level.py",
		fmt.Sprintf("%f", timeTaken),
		fmt.Sprintf("%f", runtime))

	// Run the command and capture the output
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Failed to execute command: %s\nError: %v\nOutput: %s", cmd.String(), err, string(output))
		return "", err
	}

	fmt.Println("mmmm: ", string(output))

	// Print the predicted level and difficulty
	fmt.Printf("Predicted Level: %s", string(output))
	fmt.Println("difficulty: ", difficulty)

	return strings.TrimSpace(string(output)), nil
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
