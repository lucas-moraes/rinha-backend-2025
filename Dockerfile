FROM node:18-alpine

RUN apk add --no-cache bash git openssh

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN chmod +x ./entrypoint.sh

RUN npm run build

EXPOSE 9999

ENTRYPOINT ["./entrypoint.sh"]

