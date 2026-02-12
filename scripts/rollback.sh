#!/bin/bash
# Rollback script for calme2me

set -e

BACKUP_TAG=${1:-previous}

echo "⏮️  Rolling back to $BACKUP_TAG..."

# Stop current deployment
echo "🛑 Stopping current deployment..."
docker-compose down

# Check if backup tag exists
if docker images | grep "calme2me-frontend" | grep "$BACKUP_TAG" > /dev/null; then
    echo "↩️  Restoring from backup..."
    
    # Tag backup as current
    docker tag calme2me-frontend:$BACKUP_TAG calme2me-frontend:current
    docker tag calme2me-backend:$BACKUP_TAG calme2me-backend:current
    
    # Start previous version
    export TAG=$BACKUP_TAG
    docker-compose up -d
    
    echo "✅ Rollback completed successfully!"
else
    echo "❌ Backup image not found for tag: $BACKUP_TAG"
    exit 1
fi
