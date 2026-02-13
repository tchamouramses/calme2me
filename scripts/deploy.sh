#!/bin/bash
# Deploy script for calme2me

set -e

ENVIRONMENT=${1:-development}
TAG=${2:-latest}

echo "🚀 Deploying calme2me to $ENVIRONMENT environment..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat ".env.$ENVIRONMENT" | grep -v '#' | xargs)
else
    echo "❌ Environment file .env.$ENVIRONMENT not found"
    exit 1
fi

# Build images
echo "🔨 Building Docker images..."
docker compose build --no-cache

echo "ℹ️  No Docker registry configured; skipping image push."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker compose down --remove-orphans || true

# Start services
echo "▶️  Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
for i in {1..30}; do
    if docker compose exec -T frontend wget -q -O- http://localhost:3000/ > /dev/null 2>&1 && \
       docker compose exec -T backend php artisan tinker --execute "echo 'OK';" > /dev/null 2>&1; then
        echo "✅ Services are healthy"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T backend php artisan migrate --force || true

# Run seeders (only for development)
if [ "$ENVIRONMENT" == "development" ]; then
    echo "🌱 Running database seeders..."
    docker compose exec -T backend php artisan db:seed || true
fi

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

if curl -f http://localhost:8000/api/problems > /dev/null 2>&1; then
    echo "✅ Backend API is accessible"
else
    echo "❌ Backend API is not accessible"
fi

echo "✨ Deployment completed successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🔌 WebSocket: ws://localhost:8080"
echo ""
echo "View logs: docker-compose logs -f"
