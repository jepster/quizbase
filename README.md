# Quizbase

Generates a quiz content database via the API from [Perplexity](https://perplexity.ai). Potentially, it can also generate any content with the corresponding prompt. You can use this application as a base or example for your use cases.
![Database](img/mongodb-database.png)

Also, there is a frontend for quiz gaming with the generated quiz questions.

## Setup
* Install the [just](https://github.com/casey/just) command runner for using the helper commands from the `.justfile`.
  * `just dev`
* Copy the `server/.env.dist` file to `server/.env` and set your [Perplexity API key](https://www.perplexity.ai/account/api/keys) here
* The client has also its environment file. E.g. `.env.production` for the production environment.

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
The nest.js commands can be run like this with the [just](https://github.com/casey/just) command runner:
```
just mongodb-import-questions "AI" "What is the best AI tool?"
```

## Connect to MongoDB database
It's recommended to use [Compass](https://www.mongodb.com/products/tools/compass) as database UI tool. You can use this connection string:
```
mongodb://root:example@localhost:27017
```