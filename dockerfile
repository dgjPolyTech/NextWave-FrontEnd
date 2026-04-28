FROM node:22-alpine

WORKDIR /workspace

RUN apk update && apk add --no-cache bash

COPY package.json package-lock.json* ./
RUN npm ci

COPY . . 

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
