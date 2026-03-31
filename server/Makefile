.PHONY: run build clean dev

run:
	go run cmd/main.go

build:
	go build -o bin/server cmd/main.go

clean:
	rm -rf bin/

dev:
	air

install:
	go mod download

tidy:
	go mod tidy
