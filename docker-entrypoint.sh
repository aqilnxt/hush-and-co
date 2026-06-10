#!/bin/sh
set -e

echo "=== Starting Laravel Application ==="

# Copy Railway environment if exists
if [ -f .env.railway ]; then
    echo "Copying Railway environment configuration..."
    cp .env.railway .env
fi

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Wait for database with timeout
echo "Waiting for database..."
max_attempts=30
attempt=1
until php -r "
\$host = getenv('DB_HOST') ?: '127.0.0.1';
\$port = getenv('DB_PORT') ?: 3306;
\$timeout = 5;
\$socket = @fsockopen(\$host, \$port, \$errno, \$errstr, \$timeout);
if (\$socket) {
    fclose(\$socket);
    echo 'Database connection successful';
    exit(0);
} else {
    echo 'Database connection failed';
    exit(1);
}
" 2>&1; do
    if [ $attempt -ge $max_attempts ]; then
        echo "Failed to connect to database after $max_attempts attempts"
        exit 1
    fi
    echo "Database attempt $attempt/$max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Create storage link
echo "Creating storage link..."
php artisan storage:link || true

echo "=== Application Ready ==="
echo "Starting Laravel development server on 0.0.0.0:${PORT:-8000}"

# Start server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
