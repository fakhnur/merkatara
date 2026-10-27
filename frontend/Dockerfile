# Multi-stage production build for React Vite SPA
FROM node:26-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_LOGROCKET_APP_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LOGROCKET_APP_ID=$VITE_LOGROCKET_APP_ID

COPY package*.json tsconfig*.json vite.config.ts index.html ./
RUN npm ci

COPY src ./src
RUN npm run build

# Nginx Alpine Production Runner
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
