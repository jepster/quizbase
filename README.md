# Quizbase

## Local usage and live deployment
It's meant to run the local app via npm.

## Let's encrypt certificates
To renew them, you must deploy the following files:
* docker-compose.letsencrypt.yml
* nginx.conf.letsencrypt
Rename them to
* docker-compose.yml
* nginx.conf
Deploy them and run `docker-compose up` on the digitalocean server. Afterwards we get the certs into the `certbot-conf` volume
in the docker-compose setup. Then revert the docker-compose and nginx config file and redeploy.

## Commands
The nest.js commands can be run like this:
```
npm run build && node dist/cli.js perplexity-command --category="Ukrainekrieg"
```