# Configuration rapide - Jenkins pour calme2me

## 🚀 Démarrage en 10 minutes

### 1️⃣ Générer les credentials

```bash
# Rendre le script exécutable
chmod +x scripts/generate_credentials.sh

# Générer les fichiers de credentials
./scripts/generate_credentials.sh

# Les credentials sont générés dans ./credentials/
ls -la credentials/
```

### 2️⃣ Créer les credentials dans Jenkins

#### Manière automatique (Script Groovy)

```bash
1. Aller à: Jenkins → Script Console (port 8080/script)

2. Copier le contenu de: scripts/create_jenkins_credentials.groovy

3. Coller et exécuter (Run)

4. Les credentials seront créés automatiquement ✓
```

#### Manière manuelle (UI)

```bash
1. Jenkins → Manage Jenkins → Manage Credentials

2. Click "System" → "Global credentials (unrestricted)"

3. Click "Add Credentials" pour chaque ligne:

   Exemple pour APP_KEY:
   - Kind: Secret text
   - Secret: [copier du fichier credentials/app-key-production.txt]
   - ID: app-key-production
   - Description: Production Laravel APP_KEY
   - Click "Create"

4. Répéter pour tous les credentials (voir liste ci-dessous)
```

---

## 📋 Liste des credentials à créer

### Copier depuis les fichiers générés

```bash
# Docker
cat credentials/docker-registry-url.txt          → docker-registry-url
cat credentials/docker-username.txt              → docker-credentials (username)
cat credentials/docker-password.txt              → docker-credentials (password)

# Development
cat credentials/app-key-development.txt          → app-key-development
cat credentials/reverb-app-key-development.txt   → reverb-app-key-development
cat credentials/database-development.txt         → db-host/username/password-development
cat credentials/domains-development.txt          → frontend-domain/backend-domain-development
cat credentials/redis-development.txt            → redis-host/password-development

# Staging
cat credentials/app-key-staging.txt              → app-key-staging
cat credentials/reverb-app-key-staging.txt       → reverb-app-key-staging
cat credentials/database-staging.txt             → db-host/username/password-staging
cat credentials/domains-staging.txt              → frontend-domain/backend-domain-staging
cat credentials/redis-staging.txt                → redis-host/password-staging

# Production
cat credentials/app-key-production.txt           → app-key-production
cat credentials/reverb-app-key-production.txt    → reverb-app-key-production
cat credentials/database-production.txt          → db-host/username/password-production
cat credentials/domains-production.txt           → frontend-domain/backend-domain-production
cat credentials/redis-production.txt             → redis-host/password-production
```

---

## 🔨 Créer le Jenkins Pipeline

### Étape 1: Créer une nouvelle tâche (Job)

```bash
Jenkins → New Item

Name: calme2me-deployment
Type: Pipeline
Click "Create"
```

### Étape 2: Configurer le pipeline

```bash
General:
  ☑ GitHub project
  Project Url: https://github.com/your-org/calme2me

Build Triggers:
  ☑ GitHub hook trigger for GITScm polling

Pipeline:
  Definition: Pipeline script from SCM
  SCM: Git
  Repository URL: https://github.com/your-org/calme2me.git
  Credentials: [Select your GitHub credentials]
  Branch: */main
  Script Path: Jenkinsfile

Click "Save"
```

### Étape 3: Tester le pipeline

```bash
# Exécuter une build manuelle
Build with Parameters

ENVIRONMENT: development
TAG: latest
SKIP_TESTS: false
PUSH_REGISTRY: false

Click "Build"

# Attendre la compilation...
# Vérifier les logs
```

---

## 🎯 Déclencher des déploiements

### Via GitHub Webhook (Automatique)

```bash
1. Dans Jenkins:
   Configuration du job → Build Triggers
   ☑ "GitHub hook trigger for GITScm polling"

2. Dans GitHub:
   Settings → Webhooks → Add webhook
   Payload URL: https://your-jenkins.com/github-webhook/
   Content type: application/json
   Events: Push events
   ☑ Active

3. À chaque push sur main:
   - GitHub envoie un webhook
   - Jenkins reçoit la notification
   - Build démarre automatiquement ✓
```

### Via Jenkins UI (Manuel)

```bash
1. Jenkins → calme2me-deployment

2. Build with Parameters:
   - ENVIRONMENT: staging (ou production)
   - TAG: v1.0.0
   - SKIP_TESTS: false
   - PUSH_REGISTRY: true

3. Click "Build"

4. Voir les logs en direct
```

### Via CLI

```bash
# Exécuter une build
java -jar jenkins-cli.jar -s http://localhost:8080 \
     build calme2me-deployment \
     -p ENVIRONMENT=production \
     -p TAG=v1.0.0 \
     -p PUSH_REGISTRY=true

# Attendre la fin
java -jar jenkins-cli.jar -s http://localhost:8080 \
     wait-node-online node1
```

---

## 📊 Architecture du pipeline

```
┌─────────────────┐
│ Commit sur main │
└────────┬────────┘
         │
         ▼
    ┌─────────────┐
    │  Checkout   │ (Clone du repo)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │Récupère     │ (Charge les secrets Jenkins)
    │Credentials  │
    └──────┬──────┘
           │
    ┌──────▼──────────────────┐
    │ Demande les paramètres  │
    │ - Environment           │
    │ - Tag                   │
    │ - Skip Tests            │
    │ - Push Registry         │
    └──────┬──────────────────┘
           │
    ┌──────▼──────┐
    │Build Images │ (Frontend + Backend Docker)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │Tests        │ (Si SKIP_TESTS=false)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │Push Registry│ (Si PUSH_REGISTRY=true)
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │Deploy               │
    │ - Export vars env   │
    │ - Start docker-cmps │
    │ - Run migrations    │
    └──────┬──────────────┘
           │
    ┌──────▼──────┐
    │Health Check │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │Smoke Tests  │
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │✓ Déploiement OK │
    └─────────────────┘
```

---

## 🔗 Domaines finaux

Une fois déployé, vos applications seront accessibles sur:

### Development
```
Frontend:  http://calme2me.local:3000
Backend:   http://api.calme2me.local:8000
WebSocket: ws://api.calme2me.local:8080
API:       http://api.calme2me.local:8000/api
```

### Staging
```
Frontend:  https://calme2me-staging.com
Backend:   https://api-staging.calme2me.com
WebSocket: wss://api-staging.calme2me.com:8080
API:       https://api-staging.calme2me.com/api
```

### Production
```
Frontend:  https://calme2me.com
Backend:   https://api.calme2me.com
WebSocket: wss://api.calme2me.com:8080
API:       https://api.calme2me.com/api
```

---

## 🐛 Troubleshooting

### Les credentials ne sont pas trouvés
```bash
# Vérifier dans Jenkins
Jenkins → Manage Credentials → System → Global credentials

# Rechercher le credential manquant
# Vérifier que l'ID est exact (case-sensitive!)
```

### Build échoue à la connexion Docker
```bash
# Vérifier les credentials docker-credentials
# Vérifier que le registry est accessible
curl -u username:password https://your-registry.com/v2/
```

### Les variables d'environnement ne sont pas passées
```bash
# Vérifier les logs Jenkins
Jenkins → Console Output

# Chercher les lignes:
# "export APP_KEY="
# Elles devraient afficher *** (masqué)
```

### Deployment échoue
```bash
# Consulter les logs du service
docker-compose logs backend
docker-compose logs mysql
docker-compose logs nginx

# Vérifier la santé des conteneurs
docker-compose ps

# Vérifier les variables d'environnement
docker-compose exec backend env | grep DB_
```

---

## ✅ Checklist avant production

- [ ] Tous les credentials créés dans Jenkins
- [ ] Test de déploiement en development ✓
- [ ] Test de déploiement en staging ✓
- [ ] Domaines pointent vers les bons serveurs
- [ ] SSL/TLS configuré et valide
- [ ] Backups des bases de données configurés
- [ ] Monitoring en place
- [ ] Webhooks GitHub activés
- [ ] Logs Jenkins archivés
- [ ] Documentation à jour

---

## 📈 Monitoring et logs

### Voir les logs du déploiement

```bash
# Dans Jenkins
Jenkins → calme2me-deployment → Build #123 → Console Output

# Rechercher pour des erreurs
grep -i error /var/log/jenkins/jobs/calme2me-deployment/builds/123/log
```

### Vérifier la santé des services

```bash
# Exécuter le health check manuellement
./scripts/healthcheck.sh

# Vérifier les logs des conteneurs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f nginx
```

### Métriques et alertes

Ajouter des notifications dans Jenkins post:
```groovy
post {
    success {
        // Envoyer notification Slack
        slackSend(color: 'good', message: 'Deployment successful')
    }
    failure {
        // Envoyer alerte email
        emailext(to: 'devops@company.com', subject: 'Deployment failed')
    }
}
```

---

## 📞 Support

Pour plus de détails, voir:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide complet du déploiement
- [JENKINS_CREDENTIALS_SETUP.md](./JENKINS_CREDENTIALS_SETUP.md) - Configuration detaillée des credentials
- [QUICKSTART.md](./QUICKSTART.md) - Docker & scripts rapides
