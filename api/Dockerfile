FROM node:18.17.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

COPY .env .env

EXPOSE 5001

CMD ["npm", "run", "start:prod"]
