.DEFAULT_GOAL := help

COMPOSE := docker compose
COMPOSE_DEV := docker compose -f docker-compose.dev.yml

.PHONY: help up down start stop dev-backend dev-frontend backend-format backend-lint backend-test

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## .*' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

up: ## Start app (frontend :3000, backend :5000)
	$(COMPOSE) up

start: ## Start stopped app (frontend :3000, backend :5000)
	$(COMPOSE) start

stop: ## Stop app (keeps containers, unlike down)
	$(COMPOSE) stop

down: ## Stop and remove app containers
	$(COMPOSE) down

dev-backend: ## Start backend dev container and drop into shell
	$(COMPOSE_DEV) up -d backend
	$(COMPOSE) exec backend bash

dev-frontend: ## Start dev containers and drop into frontend shell
	$(COMPOSE_DEV) up -d
	$(COMPOSE) exec -d backend sh ./start_dev.sh
	$(COMPOSE) exec frontend sh

backend-format: ## Format backend code (ruff format, inside running container)
	$(COMPOSE) exec backend ruff format .

backend-lint: ## Lint backend code (ruff check, inside running container)
	$(COMPOSE) exec backend ruff check

backend-test: ## Run backend tests (pytest, inside running container)
	$(COMPOSE) exec backend pytest -q
