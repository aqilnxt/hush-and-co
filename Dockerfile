FROM dunglas/frankenphp:php8.3.31-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git zip unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (including GD)
RUN install-php-extensions bcmath curl dom fileinfo filter gd hash mbstring openssl pdo pdo_mysql session tokenizer xml zip

# Copy composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy app files
COPY . .

# Install dependencies with --ignore-platform-reqs
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# Install Node & npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs

# Build frontend
COPY package*.json ./
RUN npm ci && npm run build && npm prune --omit=dev

# Laravel caching
RUN mkdir -p storage/framework/{sessions,views,cache,testing} storage/logs bootstrap/cache && chmod -R a+rw storage
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# Start command
CMD ["php", "artisan", "migrate", "--force", "&&", "php", "artisan", "storage:link", "&&", "php", "artisan", "serve", "--host=0.0.0.0", "--port=$PORT"]
