FROM node:22.12.0-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 9000

CMD ["npm", "run", "start"]