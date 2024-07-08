package main

import (
	"fmt"

	"github.com/karthiknayak6/adaptive-coding-app/internal/server"
)

func main() {

	server, err := server.NewServer()
	if err != nil {
		panic("Server creation failed!!")
	}
	err = server.ListenAndServe()
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}
