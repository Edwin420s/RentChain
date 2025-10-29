# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./ 2>/dev/null || :

RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

LABEL maintainer="dev@zurirent.xyz"
LABEL description="ZuriRent Frontend Application"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /healthcheck.sh

CMD ["nginx", "-g", "daemon off;"]
