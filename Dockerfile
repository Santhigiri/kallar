# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install


# Pass the build arguments
ARG VITE_APP_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

ARG VITE_TVM_BASE_URL
ENV VITE_TVM_BASE_URL=$VITE_TVM_BASE_URL

# Build identity (dev/staging/prod + the CI-generated version tag) — baked
# into the bundle by vite.config.ts's `define` block and surfaced via
# src/lib/version.ts (app icon, manifest name, sidebar footer, boot log).
ARG VITE_APP_ENV
ENV VITE_APP_ENV=$VITE_APP_ENV

ARG VITE_APP_VERSION
ENV VITE_APP_VERSION=$VITE_APP_VERSION

COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
