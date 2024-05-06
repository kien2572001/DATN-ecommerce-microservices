start:
	docker compose -f docker-compose.dev.yml up -d
down:
	docker compose -f docker-compose.dev.yml down
stop:
	docker compose -f docker-compose.dev.yml kill
	docker compose -f docker-compose.dev.yml rm -f