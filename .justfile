PROJECT_NAME := "quizbase"

@default:
  just --list

deploy:
    just rsync
    ssh root@104.248.132.247 "cd app && cp client/.env.production client/.env"
    ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp server/.env.dist server/.env"
    ssh -t root@104.248.132.247 "cd app && docker-compose down"
    ssh -t root@104.248.132.247 "cd app && docker-compose build frontend"
    ssh -t root@104.248.132.247 "cd app && docker-compose up -d"
#    ssh -t root@104.248.132.247 "docker exec -it app_backend_1 node dist/cli.js delete-database-command"
#    ssh -t root@104.248.132.247 "docker exec -it mongodb mongorestore --authenticationDatabase admin -u root -p example --db quizbase /data/db/dump/quizbase"

deploy-with-dependencies:
    rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=cypress-tests root@104.248.132.247:/root/app
    ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp client/.env.dist client/.env"
    ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp server/.env.dist server/.env"
    ssh -t root@104.248.132.247 "docker exec -it app_backend_1 node dist/cli.js delete-database-command"
    ssh -t root@104.248.132.247 "cd app && docker-compose down"
    ssh -t root@104.248.132.247 "cd app && docker-compose build frontend"
    ssh -t root@104.248.132.247 "cd app && docker-compose up -d"

rsync:
    rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=.git --exclude=cypress-tests --exclude=client/.env.local --exclude=client/node_modules/ --exclude=client/node_modules/ --exclude=server/node_modules/ root@104.248.132.247:/root/app

ssh:
    ssh -t root@104.248.132.247 'cd /root/app && bash -l'

start-client-dev:
    cd client && npm run dev

start-server-dev:
    cd server && npm run start:debug

open-chrome-with-wsl-ip:
    #!/usr/bin/env sh
    IP=$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)
    explorer.exe "http://$IP:9000"

mongodb-container-up:
    docker compose -p {{PROJECT_NAME}} -f ./docker-compose.dev.yml up -d

mongodb-container-down:
    docker compose -p {{PROJECT_NAME}} -f ./docker-compose.dev.yml down --volumes --remove-orphans

mongodb-import-questions category topic:
    cd server && npm run build && node dist/cli.js perplexity-command --category "{{category}}" --topic "{{topic}}"

mongodb-delete-database:
    cd server && npm run build && node dist/cli.js delete-database-command

mongodb-dump:
    sudo rm -rf dump/quizbase
    docker exec -it {{PROJECT_NAME}}_mongodb mongodump --authenticationDatabase admin -u root -p example --db quizbase --out /data/db/dump

mongodb-restore:
    docker exec -it {{PROJECT_NAME}}_mongodb mongorestore --authenticationDatabase admin -u root -p example --db quizbase /data/db/dump/quizbase

dev:
    concurrently "cd client && npm run dev" "cd server && npm run --inspect-brk start:debug" "docker compose -p {{PROJECT_NAME}} -f ./docker-compose.dev.yml up -d"

cypress-open-ui:
    cd cypress-tests && npx cypress open

cypress-run-tests:
    cd cypress-tests && npx cypress run

cypress-test-asynchronous-game:
    cd cypress-tests && npx cypress run --spec "cypress/e2e/asynchronous-game.cy.js"

test-integration:
    cd server && npm run test:integration

# Creating an optimized production build. Precheck before deploy.
client-build:
    cd client && npm run build