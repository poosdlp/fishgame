# Base
FROM node:25-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies
FROM base AS deps
RUN npm install

# Development
FROM deps AS devel
WORKDIR /app
COPY . .
EXPOSE 80
CMD ["npm", "run", "dev", "--", "--port", "80", "--host"]

# Build
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# Production
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]