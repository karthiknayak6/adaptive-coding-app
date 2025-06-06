package models

type TestCase struct {
	TestCaseID int         `json:"test_case_id"`
	Input  interface{} `json:"input"`
	Output interface{} `json:"output"`
}

type Problem struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Boilerplate string     `json:"boilerplate"`
	Difficulty  string     `json:"difficulty"`
	TestCases   []TestCase `json:"test_cases"`
}

type ProblemsFile struct {
	Problems []Problem `json:"problems"`
}
