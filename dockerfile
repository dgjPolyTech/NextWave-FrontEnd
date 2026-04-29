FROM node:22-alpine

WORKDIR /workspace

RUN apk update && apk add --no-cache bash

COPY package.json package-lock.json* ./
RUN npm ci
RUN npm install --save-dev @types/react @types/node @types/react-dom

COPY . . 

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
