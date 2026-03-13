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
EXPOSE 3000
# Runs the development script
CMD ["npm", "run", "dev"]

# Build
FROM deps AS build
WORKDIR /app
COPY . .

# Strip out devDependencies
RUN npm prune --omit=dev

# Production
FROM node:25-alpine AS prod
WORKDIR /app
# Copy the pruned app from the build stage
COPY --from=build /app ./
EXPOSE 3000

# Runs the optimized production script
CMD ["npm", "start"]