deploy:
	rsync -e "ssh -o StrictHostKeyChecking=no" -rltgoD --no-perms --no-owner --no-group --no-times --progress --delete -v --stats --progress ./ root@104.248.132.247:/root/app

ssh:
	ssh root@104.248.132.247
