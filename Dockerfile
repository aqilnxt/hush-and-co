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

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=15s --timeout=10s --start-period=60s --retries=5 \
    CMD php -r "exit(file_get_contents('http://localhost:' . getenv('PORT', 8000)) !== false ? 0 : 1);" || exit 1

# Use entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
