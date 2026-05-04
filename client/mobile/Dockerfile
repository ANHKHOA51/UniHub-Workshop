FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]
