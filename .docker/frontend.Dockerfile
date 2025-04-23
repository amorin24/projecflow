# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Copy Docker-specific tsconfig for build
COPY .docker/build-config/tsconfig.docker.json ./tsconfig.docker.json

# Build the application with Docker-specific config
RUN NODE_ENV=production npx vite build

# Production stage
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration - use ARG to allow overriding during build
ARG NGINX_CONF=.docker/nginx.conf
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
