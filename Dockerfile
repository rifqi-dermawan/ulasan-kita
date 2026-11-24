# Stage 1: Build aset Vite / Tailwind
FROM node:20-alpine AS assets
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=1024"
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Runtime Laravel (Nginx + PHP-FPM Alpine)
FROM serversideup/php:8.4-fpm-nginx-alpine

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY --chown=www-data:www-data . .
COPY --from=assets --chown=www-data:www-data /app/public/build ./public/build

RUN composer dump-autoload --optimize \
    && mkdir -p storage/app/public \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8080
