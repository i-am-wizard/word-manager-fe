FROM node:22-alpine AS builder
WORKDIR /app
COPY vite-frontend/ ./
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
