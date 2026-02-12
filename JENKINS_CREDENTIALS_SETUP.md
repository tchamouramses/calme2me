# Configuration Jenkins pour calme2me

## 📋 Vue d'ensemble

Le pipeline Jenkins utilise des **Jenkins Credentials** pour gérer toutes les variables d'environnement. Cela permet de:
- ✅ Sécuriser les données sensibles (mots de passe chiffrés)
- ✅ Centraliser la configuration par environnement
- ✅ Faciliter les mises à jour sans modifier le code
- ✅ Supporter 3 environnements (development, staging, production)

## 🔧 Configuration requise

### 1. Accéder à Jenkins

```
http://localhost:8080  (local)
https://your-jenkins.com  (production)
```

### 2. Naviguer vers Credentials

```
Jenkins → Manage Jenkins → Manage Credentials → System → Global credentials (unrestricted)
```

---

## 📝 Variables à créer

### 📌 Groupe 1: Docker Registry

| ID | Type | Valeur | Description |
|----|------|--------|-------------|
| `docker-registry-url` | Secret text | `registry.docker.com` ou `registry.company.com` | URL du registre Docker |
| `docker-credentials` | Username with password | Username + Token | Identifiants de connexion au registre |

**Actions:**
1. Click "Add Credentials"
2. Type: "Username with password"
3. ID: `docker-credentials`
4. Username: `your-docker-username`
5. Password: `your-docker-token` (or PAT)
6. Save

---

### 📌 Groupe 2: Domaines (À CRÉER POUR CHAQUE ENVIRONNEMENT)

#### **DEVELOPMENT**

| ID | Type | Valeur |
|----|------|--------|
| `frontend-domain-development` | Secret text | `calme2me.local` |
| `backend-domain-development` | Secret text | `api.calme2me.local` |
| `app-url-development` | Secret text | `http://api.calme2me.local:8000` |
| `api-url-development` | Secret text | `http://api.calme2me.local:8000/api` |
| `vite-api-url-development` | Secret text | `http://api.calme2me.local:8000/api` |

#### **STAGING**

| ID | Type | Valeur |
|----|------|--------|
| `frontend-domain-staging` | Secret text | `calme2me-staging.com` |
| `backend-domain-staging` | Secret text | `api-staging.calme2me.com` |
| `app-url-staging` | Secret text | `https://api-staging.calme2me.com` |
| `api-url-staging` | Secret text | `https://api-staging.calme2me.com/api` |
| `vite-api-url-staging` | Secret text | `https://api-staging.calme2me.com/api` |

#### **PRODUCTION**

| ID | Type | Valeur |
|----|------|--------|
| `frontend-domain-production` | Secret text | `calme2me.com` |
| `backend-domain-production` | Secret text | `api.calme2me.com` |
| `app-url-production` | Secret text | `https://api.calme2me.com` |
| `api-url-production` | Secret text | `https://api.calme2me.com/api` |
| `vite-api-url-production` | Secret text | `https://api.calme2me.com/api` |

---

### 📌 Groupe 3: Application Keys (À CRÉER POUR CHAQUE ENVIRONNEMENT)

Générer des clés avec:
```bash
# Pour Laravel APP_KEY
php artisan key:generate --no-interaction

# Pour Reverb App Key
openssl rand -base64 32
```

#### **DEVELOPMENT**

| ID | Type | Valeur |
|----|------|--------|
| `app-key-development` | Secret text | `base64:xxxxxxxxxxxx...` (généré) |
| `reverb-app-key-development` | Secret text | `yyyyyyyyyyyyyyyy...` (généré) |
| `openai-api-key-development` | Secret text | `sk-proj-xxxxx...` (optionnel) |

#### **STAGING**

| ID | Type | Valeur |
|----|------|--------|
| `app-key-staging` | Secret text | `base64:xxxxxxxxxxxx...` (unique) |
| `reverb-app-key-staging` | Secret text | `yyyyyyyyyyyyyyyy...` (unique) |
| `openai-api-key-staging` | Secret text | `sk-proj-xxxxx...` |

#### **PRODUCTION**

| ID | Type | Valeur |
|----|------|--------|
| `app-key-production` | Secret text | `base64:xxxxxxxxxxxx...` (unique) |
| `reverb-app-key-production` | Secret text | `yyyyyyyyyyyyyyyy...` (unique) |
| `openai-api-key-production` | Secret text | `sk-proj-xxxxx...` |

---

### 📌 Groupe 4: Database (À CRÉER POUR CHAQUE ENVIRONNEMENT)

#### **DEVELOPMENT**

| ID | Type | Valeur |
|----|------|--------|
| `db-host-development` | Secret text | `mysql` |
| `db-port-development` | Secret text | `3306` |
| `db-username-development` | Secret text | `calme2me` |
| `db-password-development` | Secret text | `password` |
| `db-root-password-development` | Secret text | `root` |
| `db-database-development` | Secret text | `calme2me_dev` |

#### **STAGING**

| ID | Type | Valeur |
|----|------|--------|
| `db-host-staging` | Secret text | `mysql.staging.internal` ou IP |
| `db-port-staging` | Secret text | `3306` |
| `db-username-staging` | Secret text | `calme2me_staging` |
| `db-password-staging` | Secret text | `<mot-de-passe-sécurisé>` |
| `db-root-password-staging` | Secret text | `<mot-de-passe-root-sécurisé>` |
| `db-database-staging` | Secret text | `calme2me_staging` |

#### **PRODUCTION**

| ID | Type | Valeur |
|----|------|--------|
| `db-host-production` | Secret text | `mysql.prod.internal` ou RDS endpoint |
| `db-port-production` | Secret text | `3306` |
| `db-username-production` | Secret text | `calme2me_prod` |
| `db-password-production` | Secret text | `<mot-de-passe-très-sécurisé>` ⚠️ |
| `db-root-password-production` | Secret text | `<mot-de-passe-root-très-sécurisé>` ⚠️ |
| `db-database-production` | Secret text | `calme2me_prod` |

---

### 📌 Groupe 5: Redis (STAGING & PRODUCTION seulement)

#### **STAGING**

| ID | Type | Valeur |
|----|------|--------|
| `redis-host-staging` | Secret text | `redis.staging.internal` |
| `redis-port-staging` | Secret text | `6379` |
| `redis-password-staging` | Secret text | `<redis-password>` |

#### **PRODUCTION**

| ID | Type | Valeur |
|----|------|--------|
| `redis-host-production` | Secret text | `redis.prod.internal` ou ElastiCache |
| `redis-port-production` | Secret text | `6379` |
| `redis-password-production` | Secret text | `<redis-password-sécurisé>` ⚠️ |

#### **DEVELOPMENT** (optionnel)

| ID | Type | Valeur |
|----|------|--------|
| `redis-host-development` | Secret text | `redis` |
| `redis-port-development` | Secret text | `6379` |
| `redis-password-development` | Secret text | `` (vide) |

---

## 🚀 Étapes de configuration

### Étape 1: Créer les secrets Docker

```bash
# Jenkins → Manage Jenkins → Manage Credentials

1. Click "Add Credentials"
2. Kind: "Secret text"
3. Secret: docker-registry-url
4. ID: docker-registry-url
5. Save

# Répéter pour docker-credentials (Username with password)
```

### Étape 2: Générer les clés d'application

```bash
# Générer APP_KEY
docker run --rm php:8.2-cli php -r "echo 'base64:' . base64_encode(random_bytes(32));"

# Générer Reverb App Key
openssl rand -base64 32

# Copier ces valeurs dans Jenkins Credentials
```

### Étape 3: Créer les secrets par environnement

Pour **chaque environnement** (development, staging, production):

```bash
# Dans Jenkins:
Manage Jenkins → Manage Credentials → Add Credentials

# Pour app-key-development:
Kind: Secret text
Secret: base64:xxxxxxxxxxxxx
ID: app-key-development
Save

# Répéter pour tous les secrets listés ci-dessus
```

### Étape 4: Vérifier les credentials

```bash
# Lister tous les credentials
Manage Jenkins → Manage Credentials → System → Global credentials (unrestricted)

# Vérifier que tous les secrets sont présents
```

---

## 🔐 Sécurité - Bonnes pratiques

### ✅ À FAIRE

- ✅ Utiliser des **mots de passe forts** (20+ caractères)
- ✅ Stocker les mots de passe dans un **password manager** (1Password, Vault, etc.)
- ✅ **Changer régulièrement** les mots de passe
- ✅ Utiliser des **secrets uniques** par environnement
- ✅ Activer **RBAC (Role-Based Access Control)** pour les credentials
- ✅ Utiliser **SSL/TLS** pour Jenkins
- ✅ Activer **2FA** sur Jenkins

### ❌ À ÉVITER

- ❌ Ne **PAS** committer les secrets dans Git
- ❌ Ne **PAS** utiliser les mêmes credentials pour tous les environnements
- ❌ Ne **PAS** partager les mots de passe en plaintext
- ❌ Ne **PAS** laisser les secrets visibles dans les logs Jenkins

---

## 📋 Script de création automatique (optionnel)

Créer un script Groovy pour Jenkins:

```groovy
// Jenkins → Script Console

import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl
import hudson.util.Secret

def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()

// Créer credential
def credential = new StringCredentialsImpl(
    CredentialsScope.GLOBAL,
    "app-key-production",
    "Production App Key",
    Secret.fromString("base64:xxxxx")
)

store.addCredentials(Domain.global(), credential)
println("Credential added successfully")
```

---

## 🧪 Tester la configuration

### 1. Déclencher un build

```
Jenkins → Calme2me Pipeline → Build Now

Ou avec paramètres:
Build with Parameters:
- ENVIRONMENT: development
- TAG: latest
- SKIP_TESTS: false
- PUSH_REGISTRY: false
```

### 2. Vérifier les logs

```
Console Output → Search for:
- "Frontend Domain:"
- "Backend Domain:"
- "Deploying to"
- "✓ Frontend is healthy"
- "✓ Backend API is healthy"
```

### 3. Examiner les variables

```groovy
// Dans Jenkins Script Console
println(Jenkins.instance.getExtensionList('org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition').get(0).getScript())
```

---

## 📊 Matrice des credentials par environnement

```
┌─────────────────────┬──────────────┬─────────────┬──────────────┐
│ Credential          │ Development  │ Staging     │ Production   │
├─────────────────────┼──────────────┼─────────────┼──────────────┤
│ Frontend Domain     │ local dev    │ staging.com │ calme2me.com │
│ Backend Domain      │ :8000        │ api-stg.com │ api.cms.com  │
│ DB Host             │ mysql        │ db-staging  │ db-prod      │
│ DB Password         │ dev-pass     │ stg-pass    │ prod-pass ⚠️ │
│ Redis Host          │ (none)       │ redis-stg   │ redis-prod   │
│ OpenAI API Key      │ (optional)   │ (required)  │ (required)   │
└─────────────────────┴──────────────┴─────────────┴──────────────┘
```

---

## 🆘 Troubleshooting

### Les credentials ne sont pas trouvés

```bash
# Vérifier l'ID exact
Jenkins → Manage Credentials → Chercher le credential

# Vérifier le format du Jenkinsfile
grep "credentials(" Jenkinsfile

# Tester dans Script Console
Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.CredentialsProvider')[0].getCredentials()
```

### Les variables ne sont pas exportées

```bash
# Vérifier les logs du build
echo "App Key: ${APP_KEY}" (will show **)
echo "DB Host: ${DB_HOST}"

# Vérifier les variables d'environnement dans le conteneur
docker-compose exec backend env | grep DB_
docker-compose exec backend env | grep APP_
```

### Connection refused sur le domaine

```bash
# Vérifier la configuration DNS
nslookup api.calme2me.com

# Vérifier Nginx
docker-compose logs nginx | head -50

# Tester la connectivité
curl -v https://api.calme2me.com/api/problems
```

---

## 📞 Commandes utiles

```bash
# Se reconnecter à Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080 list-credentials

# Exporter la configuration
jenkins-cli offline-export

# Vérifier le fichier de credentials
cat ~/.jenkins/credentials.xml (fichier chiffré)

# Redémarrer Jenkins
systemctl restart jenkins
```

---

## 📑 Checklist de configuration

- [ ] Créer `docker-registry-url`
- [ ] Créer `docker-credentials`
- [ ] Créer domaines pour **development**
- [ ] Créer domaines pour **staging**
- [ ] Créer domaines pour **production**
- [ ] Créer app-key pour **dev/staging/prod**
- [ ] Créer reverb-app-key pour **dev/staging/prod**
- [ ] Créer database credentials pour **dev/staging/prod**
- [ ] Créer redis credentials pour **staging/prod**
- [ ] Créer openai-api-key pour **staging/prod**
- [ ] Tester avec `ENVIRONMENT=development`
- [ ] Tester avec `ENVIRONMENT=staging`
- [ ] Tester avec `ENVIRONMENT=production`
- [ ] Documenter tous les secrets générés
- [ ] Sauvegarder les secrets dans un gestionnaire sécurisé
