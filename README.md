# Quizbase

## Local usage and live deployment
It's meant to run the local app via npm.

### Local

#### Client
Navigate to the `client` folder and run the following command:
```
npm start
```
#### Server
Navigate to the `server` folder and run the following command:
```
npm run start:dev
```

#### Launch the app in the webbrowser
After the client and server are running, open the following url in webbrowser:
```
http://localhost:9000/
```

### Live
Deploy via the Makefile:
```
make deploy
```

#### HTTP basic auth
* Username: sandra
* Password: sandra
