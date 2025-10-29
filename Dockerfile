FROM node:22-alpine AS builder

WORKDIR /app
COPY htdocs/package*.json ./
RUN npm install
COPY htdocs/ .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY htdocs/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY htdocs/simple-server.js ./
COPY htdocs/db-setup.js ./

EXPOSE 3000

CMD ["node", "simple-server.js"]