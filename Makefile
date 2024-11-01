deploy:
	(cd client && rm .env && cp .env.dist .env && npm run build && cp dist/* ../../ && cp .env.local .env)
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ --exclude=client/node_modules/ --exclude=server/node_modules/ root@104.248.132.247:/root/app
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && docker-compose restart"

deploy-with-dependencies:
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ root@104.248.132.247:/root/app && cd app && docker-compose restart
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && cp client/.env.dist client/.env"
	ssh root@104.248.132.247 -o StrictHostKeyChecking=no "cd app && docker-compose restart"

ssh:
	ssh root@104.248.132.247
