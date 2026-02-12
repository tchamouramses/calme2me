#!/bin/bash
# Script de génération des credentials Jenkins pour calme2me
# Utilisation: ./generate_credentials.sh

set -e

echo "🔐 Générateur de Credentials Jenkins pour calme2me"
echo "=================================================="
echo ""

# Fonction pour générer une clé sécurisée
generate_key() {
    openssl rand -base64 32
}

# Fonction pour générer une clé Laravel
generate_app_key() {
    php -r "echo 'base64:' . base64_encode(random_bytes(32));"
}

# Créer le dossier des credentials
mkdir -p ./credentials
cd ./credentials

# Variables générales
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-docker-registry.com"}

echo "📝 Entrez vos informations:"
echo ""

# Docker Registry
read -p "URL du Docker Registry [${DOCKER_REGISTRY}]: " DOCKER_REGISTRY
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-docker-registry.com"}

read -p "Username Docker: " DOCKER_USERNAME
read -s -p "Password/Token Docker: " DOCKER_PASSWORD
echo ""

# Générer les fichiers de credentials

echo ""
echo "🔧 Génération des credentials..."
echo ""

# Groupe 1: Docker
cat > docker-registry-url.txt << EOF
${DOCKER_REGISTRY}
EOF

cat > docker-username.txt << EOF
${DOCKER_USERNAME}
EOF

cat > docker-password.txt << EOF
${DOCKER_PASSWORD}
EOF

echo "✓ Docker Registry credentials générés"

# Groupe 2: Clés d'application
for ENVIRONMENT in development staging production; do
    echo ""
    echo "🔑 Génération credentials pour ${ENVIRONMENT}..."
    
    # App Key
    APP_KEY=$(generate_app_key)
    echo "$APP_KEY" > "app-key-${ENVIRONMENT}.txt"
    
    # Reverb App Key
    REVERB_KEY=$(generate_key)
    echo "$REVERB_KEY" > "reverb-app-key-${ENVIRONMENT}.txt"
    
    # OpenAI API Key (vide par défaut)
    echo "sk-proj-" > "openai-api-key-${ENVIRONMENT}.txt"
    
    echo "✓ Application keys générées pour ${ENVIRONMENT}"
done

# Groupe 3: Domaines et URLs
echo ""
echo "📡 Configuration des domaines..."

# Development
cat > domains-development.txt << EOF
frontend-domain-development: calme2me.local
backend-domain-development: api.calme2me.local
app-url-development: http://api.calme2me.local:8000
api-url-development: http://api.calme2me.local:8000/api
vite-api-url-development: http://api.calme2me.local:8000/api
EOF

# Staging
cat > domains-staging.txt << EOF
frontend-domain-staging: calme2me-staging.com
backend-domain-staging: api-staging.calme2me.com
app-url-staging: https://api-staging.calme2me.com
api-url-staging: https://api-staging.calme2me.com/api
vite-api-url-staging: https://api-staging.calme2me.com/api
EOF

# Production
cat > domains-production.txt << EOF
frontend-domain-production: calme2me.com
backend-domain-production: api.calme2me.com
app-url-production: https://api.calme2me.com
api-url-production: https://api.calme2me.com/api
vite-api-url-production: https://api.calme2me.com/api
EOF

echo "✓ Domaines configurés"

# Groupe 4: Database
echo ""
echo "🗄️  Configuration des bases de données..."

# Development
cat > database-development.txt << EOF
db-host-development: mysql
db-port-development: 3306
db-username-development: calme2me
db-password-development: password
db-root-password-development: root
db-database-development: calme2me_dev
EOF

# Staging
cat > database-staging.txt << EOF
db-host-staging: mysql.staging.internal
db-port-staging: 3306
db-username-staging: calme2me_staging
db-password-staging: $(generate_key)
db-root-password-staging: $(generate_key)
db-database-staging: calme2me_staging
EOF

# Production
cat > database-production.txt << EOF
db-host-production: mysql.prod.internal
db-port-production: 3306
db-username-production: calme2me_prod
db-password-production: $(generate_key)
db-root-password-production: $(generate_key)
db-database-production: calme2me_prod
EOF

echo "✓ Credentials de base de données générés"

# Groupe 5: Redis
echo ""
echo "⚡ Configuration de Redis..."

cat > redis-development.txt << EOF
redis-host-development: redis
redis-port-development: 6379
redis-password-development: 
EOF

cat > redis-staging.txt << EOF
redis-host-staging: redis.staging.internal
redis-port-staging: 6379
redis-password-staging: $(generate_key)
EOF

cat > redis-production.txt << EOF
redis-host-production: redis.prod.internal
redis-port-production: 6379
redis-password-production: $(generate_key)
EOF

echo "✓ Credentials Redis générés"

# Résumé
echo ""
echo "=================================="
echo "✅ Credentials générés avec succès!"
echo "=================================="
echo ""
echo "📁 Fichiers créés dans ./credentials/"
echo ""
ls -lah .

echo ""
echo "⏭️  Prochaines étapes:"
echo "1. Consulter les fichiers générés:"
echo "   cat ./credentials/<credential>.txt"
echo ""
echo "2. Dans Jenkins:"
echo "   Manage Jenkins → Manage Credentials → System → Global credentials"
echo ""
echo "3. Créer chaque credential en copiant les valeurs des fichiers"
echo ""
echo "4. IMPORTANT: Conserver une copie sécurisée de ces credentials!"
echo ""

cd ..
