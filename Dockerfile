# Stage 1: Build the SPA
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve static build + /api proxy via the dependency-free Node server.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY server ./server
COPY package.json ./

EXPOSE 8080
CMD ["node", "server/index.mjs"]
