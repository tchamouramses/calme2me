#!/bin/bash
# Health check script for calme2me

check_service() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $service... "
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" == "$expected_code" ]; then
        echo "✅ OK ($http_code)"
        return 0
    else
        echo "❌ FAILED (expected $expected_code, got $http_code)"
        return 1
    fi
}

echo "🔍 Health Check for calme2me"
echo "======================================"

# Check frontend
check_service "Frontend" "http://localhost:3000/" 200

# Check backend API
check_service "Backend API" "http://localhost:8000/api/problems" 200

# Check database
echo -n "Checking Database... "
if docker-compose exec -T backend php artisan tinker --execute "DB::connection()->getPdo();" > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check WebSocket
echo -n "Checking WebSocket (Reverb)... "
if timeout 5 curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:8080/socket.io > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "⚠️  WebSocket connection (expected for new connections)"
fi

# Check Nginx
echo -n "Checking Nginx... "
docker-compose ps nginx | grep "healthy" > /dev/null && echo "✅ OK" || echo "❌ FAILED"

echo "======================================"
echo "Health check completed"
