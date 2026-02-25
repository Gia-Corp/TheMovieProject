#!/bin/bash
docker compose -f docker-compose.dev.yml up -d
docker compose exec -d backend sh ./start_dev.sh
docker compose exec frontend sh