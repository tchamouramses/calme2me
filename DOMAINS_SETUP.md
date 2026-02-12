# Configuration des domaines pour calme2me

## 🌐 Domaines par environnement

### Development (Local)

```
Frontend:   calme2me.local:3000
Backend:    api.calme2me.local:8000
WebSocket:  ws://api.calme2me.local:8080
API:        http://api.calme2me.local:8000/api
Database:   mysql:3306 (interne)
```

### Staging

```
Frontend:   calme2me-staging.com (https)
Backend:    api-staging.calme2me.com (https)
WebSocket:  wss://api-staging.calme2me.com
API:        https://api-staging.calme2me.com/api
Database:   mysql.staging.internal:3306
Redis:      redis.staging.internal:6379
```

### Production

```
Frontend:   calme2me.com (https)
Backend:    api.calme2me.com (https)
WebSocket:  wss://api.calme2me.com
API:        https://api.calme2me.com/api
Database:   mysql.prod.internal:3306
Redis:      redis.prod.internal:6379
```

---

## 🔧 Configuration locale (/etc/hosts)

### Sur Linux/Mac

```bash
# Modifier le fichier hosts
sudo nano /etc/hosts

# Ajouter les lignes suivantes:
127.0.0.1       calme2me.local
127.0.0.1       api.calme2me.local

# Sauvegarder (Ctrl+X, Y, Enter)

# Vérifier la résolution
ping calme2me.local
ping api.calme2me.local
```

### Sur Windows

```powershell
# Ouvrir le fichier hosts en tant qu'administrateur
Notepad C:\Windows\System32\drivers\etc\hosts

# Ajouter les lignes:
127.0.0.1    calme2me.local
127.0.0.1    api.calme2me.local

# Sauvegarder

# Vérifier la résolution
ping calme2me.local
ping api.calme2me.local
```

### Script automatique

```bash
# Linux/Mac
chmod +x scripts/setup_hosts.sh
./scripts/setup_hosts.sh

# Interactif - répond aux questions
# Ajoute automatiquement les entrées au fichier hosts
```

---

## 📡 Configuration DNS (Staging/Production)

### Registrar (GoDaddy, Namecheap, etc.)

Pour **Staging** (calme2me-staging.com):

```
DNS Records:
┌─────────────────┬──────────────────────┐
│ Type │ Name      │ Value                │
├──────┼───────────┼──────────────────────┤
│ A    │ @         │ 10.0.1.50 (votre IP) │
│ A    │ www       │ 10.0.1.50            │
│ A    │ api-stg   │ 10.0.1.50            │
└──────┴───────────┴──────────────────────┘
```

Pour **Production** (calme2me.com):

```
DNS Records:
┌──────┬───────────┬──────────────────────────┐
│ Type │ Name      │ Value                    │
├──────┼───────────┼──────────────────────────┤
│ A    │ @         │ XX.YY.ZZ.WW (votre IP)   │
│ A    │ www       │ XX.YY.ZZ.WW              │
│ A    │ api       │ XX.YY.ZZ.WW              │
│ MX   │ @         │ mail.company.com         │
│ TXT  │ @         │ v=spf1 include:...       │
└──────┴───────────┴──────────────────────────┘
```

---

## 🔒 SSL/TLS (Let's Encrypt)

### Obtenir des certificats gratuits

```bash
# Installation Certbot
sudo apt-get install certbot python3-certbot-nginx

# Générer certificat pour calme2me.com
sudo certbot certonly --standalone \
  -d calme2me.com \
  -d www.calme2me.com \
  -d api.calme2me.com

# Générer certificat pour staging
sudo certbot certonly --standalone \
  -d calme2me-staging.com \
  -d api-staging.calme2me.com
```

### Certificats auto-signés (Development)

```bash
# Générer certificat auto-signé
mkdir -p ssl
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/CN=calme2me.local"
```

---

## ✅ Vérifier la configuration

### Test de résolution

```bash
# DNS resolution
nslookup calme2me.local
nslookup api.calme2me.com

# Host resolution
ping calme2me.local
ping api.calme2me.local
```

### Test de connectivité HTTP

```bash
# Frontend
curl -I http://calme2me.local:3000/

# Backend API
curl -I http://api.calme2me.local:8000/api/problems

# Production
curl -I https://api.calme2me.com/api/problems
```

### Test de WebSocket

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket (dev)
wscat -c ws://api.calme2me.local:8080/socket.io

# Connect to WebSocket (prod)
wscat -c wss://api.calme2me.com/socket.io
```

---

## 🔐 Configuration Nginx pour les domaines

```nginx
# Dans nginx.conf

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name calme2me.local api.calme2me.local;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Configuration HTTPS avec virtualhost
server {
    listen 443 ssl http2;
    server_name calme2me.local;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://frontend:3000;
    }
}

server {
    listen 443 ssl http2;
    server_name api.calme2me.local;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location /api {
        proxy_pass http://backend:9000;
    }
    
    location /socket.io {
        proxy_pass http://reverb:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🚀 Configuration complète docker-compose avec domaines

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: calme2me-nginx
    ports:
      - "80:80"
      - "443:443"
    environment:
      - FRONTEND_DOMAIN=calme2me.local
      - BACKEND_DOMAIN=api.calme2me.local
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - calme2me-network
```

---

## 📊 Matrice des domaines complète

| Environnement | Frontend | Backend | WebSocket | Notes |
|---|---|---|---|---|
| **Dev** | calme2me.local:3000 | api.calme2me.local:8000 | ws://api.calme2me.local:8080 | Local /etc/hosts |
| **Staging** | calme2me-staging.com | api-staging.calme2me.com | wss://api-staging.calme2me.com | DNS configuré + Let's Encrypt |
| **Prod** | calme2me.com | api.calme2me.com | wss://api.calme2me.com | DNS Public + Let's Encrypt ⚠️ |

---

## 🆘 Troubleshooting

### Domaine n'est pas résolvable

```bash
# Vérifier /etc/hosts
cat /etc/hosts | grep calme2me

# Vider le cache DNS
# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart systemd-resolved

# Windows
ipconfig /flushdns
```

### Connexion refusée sur le domaine

```bash
# Vérifier que Nginx écoute sur 80/443
docker-compose logs nginx | head -20

# Tester directement sur localhost
curl http://localhost:3000/
curl http://localhost:8000/api/problems

# Vérifier le mapping Nginx
docker-compose exec nginx cat /etc/nginx/nginx.conf
```

### Certificat SSL invalide (Dev)

```bash
# Accepter les certificats auto-signés
curl -k https://api.calme2me.local/api/problems

# Ou ajouter au certificat de confiance (Dev seulement)
# Browser settings → Accept certificate
```

---

## 📋 Checklist domaines

- [ ] /etc/hosts configuré localement (dev)
- [ ] DNS configuré au registrar (staging/prod)
- [ ] Nginx écoute sur les domaines corrects
- [ ] Certificats SSL/TLS générés et valides
- [ ] Frontend accessibke sur le domaine
- [ ] API accessible sur le domaine
- [ ] WebSocket fonctionne sur le domaine
- [ ] Redirections HTTP→HTTPS opérationnelles
- [ ] CORS configuré pour les domaines
- [ ] Certificats vont expirer dans > 30 jours
