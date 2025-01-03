deploy:
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=cypress-tests --exclude=client-next/.env.local --exclude=client-next/node_modules/ --exclude=client/node_modules/ --exclude=server/node_modules/ root@104.248.132.247:/root/app
	ssh root@104.248.132.247 "cd app && cp server/.env.dist server/.env"
	ssh root@104.248.132.247 "cd app && cp client-next/.env.production client-next/.env"
	ssh -t root@104.248.132.247 "docker exec -it app_backend_1 node dist/cli.js delete-database-command"
	ssh -t root@104.248.132.247 "cd app && docker-compose down"
	ssh -t root@104.248.132.247 "cd app && docker-compose up -d"
	ssh -t root@104.248.132.247 "docker exec -it mongodb mongorestore --authenticationDatabase admin -u root -p example --db quizbase /data/db/dump/quizbase"

deploy-with-dependencies:
	(cd client-next && npm run build)
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=cypress-tests root@104.248.132.247:/root/app
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp client/.env.dist client/.env"
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp server/.env.dist server/.env"
	ssh -t root@104.248.132.247 "docker exec -it app_backend_1 node dist/cli.js delete-database-command"
	ssh -t root@104.248.132.247 "cd app && docker-compose down"
	ssh -t root@104.248.132.247 "cd app && docker-compose up -d"

ssh:
	ssh root@104.248.132.247

start-client-dev:
	cd client-next && npm run dev

start-server-dev:
	cd server && npm run start:debug

open-chrome-with-wsl-ip:
	@IP=$$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1); \
	explorer.exe "http://$$IP:9000"

# Questions DB
#############
DOCKER_EXEC=docker exec $(PROJECT_NAME)_php bash -c

# Definitions
#############
export PROJECT_NAME=quizbase
DOCKER_EXEC=docker exec $(PROJECT_NAME)_php bash -c
PHPSTAN_LVL=8

mongodb-container-up:
	docker compose -p $(PROJECT_NAME) -f ./docker-compose.dev.yml up -d

mongodb-container-down:
	docker compose -p $(PROJECT_NAME) -f ./docker-compose.dev.yml down --volumes --remove-orphans

import-questions:
	cd server && npm run build && node dist/cli.js perplexity-command --category "${category}"

delete-database:
	cd server && npm run build && node dist/cli.js delete-database-command

mongodb-dump:
	sudo rm -rf dump/quizbase
	docker exec -it ${PROJECT_NAME}_mongodb mongodump --authenticationDatabase admin -u root -p example --db quizbase --out /data/db/dump

mongodb-restore:
	docker exec -it ${PROJECT_NAME}_mongodb mongorestore --authenticationDatabase admin -u root -p example --db quizbase /data/db/dump/quizbase

dev:
	concurrently "cd client-next && npm run dev" "cd server && npm run --inspect-brk start:debug" "docker compose -p $(PROJECT_NAME) -f ./docker-compose.dev.yml up -d" "make open-chrome-with-wsl-ip"

cypress-open-ui:
	cd cypress-tests && npx cypress open

cypress-run-tests:
	cd cypress-tests && npx cypress run
