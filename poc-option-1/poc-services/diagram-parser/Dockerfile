FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install --production

COPY . .

EXPOSE 3003

CMD ["npm", "start"]
