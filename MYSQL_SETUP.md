# Configuration MySQL pour calme2me

## 📋 Architecture

```
docker-compose.yml
├── mysql (8.0-alpine) → Port 3306
├── backend (PHP-FPM + Laravel)
├── reverb (WebSocket)
├── frontend (React)
└── nginx (Reverse Proxy)
```

## 🚀 Guide de démarrage rapide

### 1. Démarrer les services

```bash
# Développement
docker-compose up -d

# Vérifier que MySQL est prêt
docker-compose logs mysql
```

### 2. Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose exec backend php artisan migrate

# Remplir les données d'exemple (optionnel)
docker-compose exec backend php artisan db:seed
```

### 3. Tester la connexion

```bash
# Accéder à MySQL directement
docker-compose exec mysql mysql -u calme2me -ppassword calme2me_dev

# Tester depuis le backend
docker-compose exec backend php artisan tinker
# En tinker: DB::table('problems')->count();
```

## 🔧 Variables d'environnement MySQL

```env
# .env.development
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=calme2me_dev
DB_USERNAME=calme2me
DB_PASSWORD=password
DB_ROOT_PASSWORD=root
```

### Pour staging/production:

```env
# .env.staging
DB_HOST=mysql.staging.internal
DB_DATABASE=calme2me_staging

# .env.production
DB_HOST=mysql.prod.internal
DB_DATABASE=calme2me_prod
```

## 📊 Volumes MySQL

### Structure des volumes

```yaml
volumes:
  mysql_data:              # Données persistante MySQL
  ./mysql-init:/docker-entrypoint-initdb.d  # Scripts d'initialisation
```

### Afficher les volumes

```bash
# Lister les volumes
docker volume ls | grep calme2me

# Inspecter un volume
docker volume inspect calme2me-mysql_mysql_data

# Localisation physique
docker volume inspect mysql_data | grep Mountpoint
```

### Backup du volume MySQL

```bash
# Exporter la base de données
docker-compose exec mysql mysqldump -u calme2me -ppassword calme2me_dev > backup.sql

# Sauvegarder le volume entier
docker run --rm -v mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Restaurer depuis backup
docker run --rm -v mysql_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_backup.tar.gz -C /data
```

## 🔍 Commandes MySQL utiles

### Accès direct à MySQL

```bash
# Interface MySQL
docker-compose exec mysql mysql -u calme2me -ppassword calme2me_dev

# Depuis le bash du conteneur
docker-compose exec mysql bash
mysql -u calme2me -ppassword calme2me_dev
```

### Commandes SQL courantes

```sql
-- Afficher les bases de données
SHOW DATABASES;

-- Sélectionner la base
USE calme2me_dev;

-- Lister les tables
SHOW TABLES;

-- Afficher la structure d'une table
DESCRIBE problems;
DESCRIBE comments;

-- Afficher le nombre de lignes
SELECT COUNT(*) FROM problems;
SELECT COUNT(*) FROM comments;
SELECT COUNT(*) FROM problem_reactions;

-- Afficher les derniers problèmes
SELECT id, uuid, pseudo, LEFT(body, 50) as preview, created_at 
FROM problems 
ORDER BY created_at DESC 
LIMIT 10;

-- Afficher les commentaires d'un problème
SELECT c.id, c.pseudo, LEFT(c.body, 50) as preview, COUNT(cr.id) as reactions
FROM comments c
LEFT JOIN comment_reactions cr ON c.id = cr.comment_id
WHERE c.problem_id = 1
GROUP BY c.id
ORDER BY c.created_at DESC;

-- Statistiques générales
SELECT 
  (SELECT COUNT(*) FROM problems) as total_problems,
  (SELECT COUNT(*) FROM comments) as total_comments,
  (SELECT COUNT(DISTINCT pseudo) FROM problems) as unique_users,
  (SELECT COUNT(*) FROM problem_reactions) as reaction_count;

-- Vérifier les index
SHOW INDEX FROM problems;
SHOW INDEX FROM comments;
```

## 🐛 Troubleshooting

### MySQL n'est pas accessible

```bash
# Vérifier le statut du conteneur
docker-compose ps mysql

# Voir les logs
docker-compose logs mysql

# Vérifier la connexion réseau
docker-compose exec backend nc -zv mysql 3306
```

### Erreurs de permission

```bash
# Se connecter en tant que root
docker-compose exec mysql mysql -u root -proot

# Créer l'utilisateur
CREATE USER IF NOT EXISTS 'calme2me'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON calme2me_dev.* TO 'calme2me'@'%';
FLUSH PRIVILEGES;
```

### Réinitialiser la base de données

```bash
# Supprimer le volume
docker-compose down -v

# Redémarrer (recréera les tables)
docker-compose up -d
```

### Migrations échouées

```bash
# Voir les migrations exécutées
docker-compose exec backend php artisan migrate:status

# Rollback
docker-compose exec backend php artisan migrate:rollback

# Refaire les migrations
docker-compose exec backend php artisan migrate:refresh

# Avec seeders
docker-compose exec backend php artisan migrate:refresh --seed
```

## 💾 Stratégie de sauvegarde

### Backup quotidien

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mysql_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose exec mysql mysqldump \
  -u calme2me \
  -ppassword \
  calme2me_dev > $BACKUP_FILE

gzip $BACKUP_FILE

echo "Backup créé: ${BACKUP_FILE}.gz"

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "mysql_backup_*.sql.gz" -mtime +7 -delete
```

### Restaurer depuis backup

```bash
# Décompresser
gunzip backup.sql.gz

# Restaurer la base
docker-compose exec -T mysql mysql -u calme2me -ppassword calme2me_dev < backup.sql
```

## 🔐 Sécurité Production

### Changer les mots de passe

```bash
# Générer un nouveau mot de passe
openssl rand -base64 32

# Ajouter à .env.production
DB_PASSWORD=<nouveau-mot-de-passe-généré>
DB_ROOT_PASSWORD=<nouveau-mot-de-passe-généré>
```

### Configuration MySQL sécurisée

```bash
# Lors de la première connexion
docker-compose exec mysql mysql -u root -proot

# Supprimer les utilisateurs par défaut
mysql> DELETE FROM mysql.user WHERE user='';
mysql> DELETE FROM mysql.user WHERE user='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

# Vérifier les permissions
mysql> SELECT user, host FROM mysql.user;

# Appliquer les changements
mysql> FLUSH PRIVILEGES;
```

## 📈 Optimisation Performance

### Configuration MySQL (docker-compose.yml)

```yaml
mysql:
  command: >
    --default-storage-engine=InnoDB
    --max_connections=1000
    --max_allowed_packet=256M
    --sort_buffer_size=2M
    --bulk_insert_buffer_size=16M
    --tmp_table_size=32M
    --max_heap_table_size=32M
```

### Index recommandés

```sql
-- Vérifier les index existants
SHOW INDEX FROM problems;
SHOW INDEX FROM comments;

-- Ajouter des index si nécessaire
ALTER TABLE problems ADD INDEX idx_created_at (created_at);
ALTER TABLE comments ADD INDEX idx_created_at (created_at);
ALTER TABLE problem_reactions ADD INDEX idx_reaction (reaction);
ALTER TABLE comment_reactions ADD INDEX idx_reaction (reaction);
```

## 📝 Notes importantes

- MySQL 8.0 utilise par défaut `caching_sha2_password` au lieu de `mysql_native_password`
- Les volumes persistent les données entre les redémarrages
- Le script d'initialisation (mysql-init/init.sql) s'exécute à la première création du conteneur
- Ne pas oublier de changer les mots de passe en production
- Effectuer des backups réguliers avant les mises à jour
