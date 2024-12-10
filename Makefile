deploy:
	(cd client && rm .env && cp .env.dist .env && npm run build && cp dist/* ../ && cp .env.local .env)
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=client/node_modules/ --exclude=server/node_modules/ root@104.248.132.247:/root/app
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && docker-compose down --remove-orphans && docker-compose up -d"

deploy-with-dependencies:
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git root@104.248.132.247:/root/app
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp client/.env.dist client/.env"
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp server/.env.dist server/.env"
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && docker-compose restart"

ssh:
	ssh root@104.248.132.247

start-client-dev:
	cd client && npm start

start-server-dev:
	cd server && npm run start:debug

open-chrome:
	open -a "Google Chrome" "http://localhost:9000"

# Questions DB
#############
DOCKER_EXEC=docker exec $(PROJECT_NAME)_php bash -c

# Definitions
#############
export PROJECT_NAME=quizbase
DOCKER_EXEC=docker exec $(PROJECT_NAME)_php bash -c
PHPSTAN_LVL=8

container-up:
	docker compose -p $(PROJdECT_NAME) -f ./docker-compose.dev.yml up -d

container-down:
	docker compose -p $(PROJECT_NAME) -f ./docker-compose.dev.yml down

import-questions:
	cd server && npm run build && node dist/cli.js perplexity-command

wsl-get-ai-address:
	ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1

mongodb-dump:
	docker exec -it ${PROJECT_NAME}_mongodb mongodump --authenticationDatabase admin -u root -p example --db quizbase --out /data/db/dump

mongodb-drop:
	docker exec -it ${PROJECT_NAME}_mongodb mongosh --authenticationDatabase admin -u root -p example --eval "use quizbase; db.trivia_questions.drop();"

mongodb-show:
	docker exec -it ${PROJECT_NAME}_mongodb mongosh --authenticationDatabase admin -u root -p example --eval "show dbs"

mongodb-restore:
	docker exec -it ${PROJECT_NAME}_mongodb mongorestore --authenticationDatabase admin -u root -p example --db quizbase /data/db/dump/quizbase