# Quick Start Guide - Docker & Jenkins Deployment

## 📋 Setup Checklist

### 1. Prerequisites Installation

```bash
# Install Docker Desktop (includes Docker & Docker Compose)
# https://www.docker.com/products/docker-desktop/

# Install Jenkins
# https://www.jenkins.io/doc/book/installing/

# Verify installations
docker --version
docker-compose --version
java -version
```

### 2. Jenkins Setup

#### A. Install Required Plugins
Go to Jenkins → Manage Jenkins → Manage Plugins → Available:
- [ ] Docker Pipeline
- [ ] Docker
- [ ] Git
- [ ] Pipeline
- [ ] GitHub Integration (optional)

#### B. Create Jenkins Credentials

1. **Docker Registry Credentials**
   - Jenkins → Credentials → System → Global credentials
   - Add Credentials → Username with password
   - ID: `docker-credentials`
   - Username: `your-docker-user`
   - Password: `your-docker-token`

2. **APP_KEY Credentials**
   - Add Credentials → Secret text
   - ID: `app-key-development`
   - Secret: Generate with `php artisan key:generate`
   - Repeat for `app-key-staging` and `app-key-production`

#### C. Create Pipeline Job

```groovy
1. New Item → Pipeline
2. Name: calme2me-deployment
3. Description: Deploy calme2me frontend and backend
4. Configure:
   - GitHub hook trigger for GITScm polling ✓
   - Pipeline: Pipeline script from SCM
     - SCM: Git
     - Repository URL: https://github.com/your-org/calme2me.git
     - Branch: main
     - Script Path: Jenkinsfile
```

### 3. Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/calme2me.git
cd calme2me

# Make scripts executable
chmod +x scripts/*.sh

# Copy environment files
cp .env.development .env
```

### 4. Initial Deployment

#### Development Environment

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

#### Staging Environment

```bash
# Build and deploy
./scripts/deploy.sh staging staging
```

#### Production Environment

```bash
# Using production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment Workflows

### GitHub Push Workflow
```
Push to main → GitHub Webhook → Jenkins Trigger → Build → Test → Push to Registry → Deploy
```

### Manual Deployment
```bash
# Deployment with specific tag
./scripts/deploy.sh production v1.0.0

# Deploy to staging
./scripts/deploy.sh staging develop

# Deploy to development
./scripts/deploy.sh development latest
```

### Rollback
```bash
# Rollback to previous version
./scripts/rollback.sh previous

# Rollback to specific tag
./scripts/rollback.sh v1.0.0
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks
```bash
# Run health check script
./scripts/healthcheck.sh

# Manual checks
curl http://localhost:3000/
curl http://localhost:8000/api/problems
docker-compose ps
```

### Database Operations
```bash
# Migrate database
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed

# Backup database
docker-compose exec backend php artisan backup:run

# Access database shell
docker-compose exec backend sqlite3 /app/storage/database.sqlite
```

## 🔧 Common Tasks

### Update Single Service
```bash
# Rebuild and restart backend
docker-compose up -d --build backend

# Restart frontend
docker-compose restart frontend
```

### Clear Cache
```bash
# Application cache
docker-compose exec backend php artisan cache:clear

# View cache
docker-compose exec backend php artisan cache:forget <key>
```

### Run Artisan Commands
```bash
docker-compose exec backend php artisan <command>

# Examples
docker-compose exec backend php artisan tinker
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:list
```

### View Environment Info
```bash
# Check application version
docker-compose exec backend php artisan --version

# View environment
docker-compose exec backend php artisan env

# Test database connection
docker-compose exec backend php artisan migrate:status
```

## 🔒 Security

### Enable HTTPS
```bash
# Generate self-signed certificate (development only)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem

# For production, use Let's Encrypt
# See DEPLOYMENT.md for details
```

### Environment Variables Security
```bash
# Never commit credentials
git update-index --assume-unchanged .env.production

# Use Jenkins secrets for CI/CD
# Never expose OPENAI_API_KEY, APP_KEY, DB_PASSWORD in logs
```

## 📈 Scaling

### Horizontal Scaling (Multiple Backend Instances)
```bash
# Use docker-compose scale
docker-compose up -d --scale backend=3

# Or modify docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing
Nginx automatically load balances across multiple backend instances (see nginx.conf upstream configuration).

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Validate configuration
docker-compose config

# Remove and restart
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues
```bash
# Check database container
docker-compose logs postgres

# Test connection
docker-compose exec backend php artisan tinker
# In tinker: DB::connection()->getPdo();

# Reset database
docker-compose exec backend php artisan migrate:fresh --seed
```

### WebSocket Connection Problems
```bash
# Check Reverb service
docker-compose logs reverb

# Test WebSocket
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:8080/socket.io

# Check firewall rules
# Ensure port 8080 is accessible
```

### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check for syntax errors
docker-compose config
```

## 📚 File Structure

```
project/
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── backend/
│   ├── Dockerfile
│   ├── app/
│   └── ...
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh
│   └── healthcheck.sh
├── Jenkinsfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx.conf
├── .env.development
├── .env.staging
├── .env.production
└── DEPLOYMENT.md
```

## 🎯 Next Steps

1. **Configure Jenkins**
   - [ ] Install Docker plugin
   - [ ] Add credentials
   - [ ] Create pipeline job

2. **Setup Repository**
   - [ ] Push code to GitHub/GitLab
   - [ ] Configure webhook to Jenkins
   - [ ] Test automatic triggering

3. **Customize Configuration**
   - [ ] Update Docker registry URL
   - [ ] Set API_KEY variables
   - [ ] Configure domain names
   - [ ] Set up SSL certificates

4. **Deploy**
   - [ ] Test development deployment
   - [ ] Test staging deployment
   - [ ] Schedule production deployment

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed information
- Check individual service status: `docker-compose ps`
- Run health checks: `./scripts/healthcheck.sh`
