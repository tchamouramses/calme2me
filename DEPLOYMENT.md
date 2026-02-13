# Deployment Environment Configuration for calme2me

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- Jenkins 2.360+
- Jenkins Plugins: Docker, Docker Pipeline, Git

## Jenkins Setup

### 1. Create Jenkins Credentials

```groovy
// Application Keys (for each environment)
- ID: app-key-development
- ID: app-key-staging
- ID: app-key-production
```

### 2. Create Pipeline Job

1. New Item → Pipeline
2. Name: `calme2me-deployment`
3. Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: `https://github.com/your-org/calme2me.git`
6. Pipeline: `Jenkinsfile`

### 3. Configure Build Triggers

- GitHub hook trigger for GITScm polling
- Trigger builds on push to main branch

## Deployment Instructions

### Development Environment

```bash
export ENVIRONMENT=development
export TAG=dev
export APP_KEY=$(cat .env.development | grep APP_KEY)
docker-compose -f docker-compose.yml up -d
```

### Staging Environment

```bash
export ENVIRONMENT=staging
export TAG=staging
export APP_KEY=$(cat .env.staging | grep APP_KEY)
docker-compose -f docker-compose.yml up -d
```

### Production Environment

```bash
export ENVIRONMENT=production
export TAG=$(git describe --tags)
export APP_KEY=$(cat .env.production | grep APP_KEY)
docker-compose -f docker-compose.yml up -d
```

## Docker Images

No registry is required. Images are built locally by Docker Compose or the Jenkins pipeline.

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f reverb
```

### Health Checks

```bash
# Frontend health
curl http://localhost:3000/

# Backend health
curl http://localhost:8000/api/me

# WebSocket health
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:8080/socket.io
```

## Scaling & Performance

### Horizontal Scaling

```yaml
# In docker-compose.yml, scale services
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing

Configure Nginx upstream with multiple backend instances:

```nginx
upstream backend {
    server backend-1:9000;
    server backend-2:9000;
    server backend-3:9000;
}
```

## Backup & Restore

### Backup Database

```bash
docker-compose exec backend php artisan db:dump
docker cp calme2me-backend:/app/database.sqlite ./backup/database-$(date +%Y%m%d).sqlite
```

### Restore Database

```bash
docker cp ./backup/database.sqlite calme2me-backend:/app/database.sqlite
docker-compose restart backend
```

## SSL/TLS Configuration

1. Generate self-signed cert:
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem
```

2. Or use Let's Encrypt with Certbot:
```bash
docker run --rm -v ./ssl:/etc/letsencrypt certbot/certbot \
    certonly --standalone -d your-domain.com
```

## Environment Variables

Create `.env` file:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<your-generated-key>
DB_CONNECTION=sqlite
DB_DATABASE=/app/storage/database.sqlite
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie
LARAVEL_REVERB_HOST=0.0.0.0
LARAVEL_REVERB_PORT=8080
```

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Validate docker-compose
docker-compose config

# Check port conflicts
lsof -i :3000
lsof -i :9000
lsof -i :80
lsof -i :443
```

### Database issues

```bash
# Reset database
docker-compose exec backend php artisan migrate:fresh

# Run seeders
docker-compose exec backend php artisan db:seed
```

### WebSocket not connecting

```bash
# Check Reverb service
docker-compose logs reverb

# Test WebSocket endpoint
wscat -c ws://localhost:8080/socket.io
```

## Rollback Procedure

```bash
# Tag current deployment
docker tag calme2me-frontend:current calme2me-frontend:previous
docker tag calme2me-backend:current calme2me-backend:previous

# Revert to previous
docker-compose down
export TAG=previous
docker-compose up -d
```

## Security Checklist

- [ ] SSL certificates configured
- [ ] Docker secrets used for sensitive data
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts configured
