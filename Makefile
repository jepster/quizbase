deploy:
	(cd client && rm .env && cp .env.dist .env && npm run build && cp dist/* ../ && cp .env.local .env)
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=client/node_modules/ --exclude=server/node_modules/ root@104.248.132.247:/root/app
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && docker-compose down --remove-orphans && docker-compose up -d"

deploy-with-dependencies:
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git root@104.248.132.247:/root/app && cd app && docker-compose restart
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp client/.env.dist client/.env"
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

questions_db_container_build:
	docker compose -p $(PROJECT_NAME) -f ./questions_db/container/docker-compose.yml build

questions_db_container_up:
	docker compose -p $(PROJECT_NAME) -f ./questions_db/container/docker-compose.yml up -d

questions_db_composer_install:
	$(DOCKER_EXEC) "composer install --no-interaction --optimize-autoloader"