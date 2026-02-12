# EchoCare - Plateforme de soutien anonyme

Une plateforme de soutien anonyme en temps réel avec modération IA.

## 🚀 Fonctionnalités

- **Publier des problèmes anonymement** avec modération IA (OpenAI Assistant)
- **Fil en temps réel** avec Laravel Reverb (WebSockets)
- **Dashboard admin** protégé par authentification
- **Multilingue** : Français & Anglais avec détection automatique
- **Design Glassmorphism** avec Tailwind CSS

## 🛠️ Stack Technique

**Backend**
- Laravel 12
- Laravel Sanctum (Auth API)
- Laravel Reverb (WebSockets)
- OpenAI PHP Client

**Frontend**
- React 18
- Vite
- Tailwind CSS 3
- i18next (internationalisation)
- Laravel Echo + Pusher JS
- Axios

## 📦 Installation

### Backend

```bash
cd backend
composer install
cp .env.example .env

# Configurer .env avec vos clés
# OPENAI_API_KEY=sk-...
# OPENAI_ASSISTANT_ID=asst_...

php artisan migrate
php artisan db:seed --class=AdminUserSeeder

# Lancer les serveurs
php artisan serve --host=0.0.0.0 --port=8000
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### Frontend

```bash
cd frontend
npm install

# Le front se connecte automatiquement au backend
npm run dev
```

## 🔑 Comptes Admin par défaut

- **Français :** admin@example.com / password
- **Anglais :** admin-en@example.com / password

## 🔐 Authentification API

L'API utilise l'authentification par tokens Bearer (Laravel Sanctum) :

1. **Login** : `POST /api/login` retourne un `token`
2. **Requêtes authentifiées** : Ajouter `Authorization: Bearer {token}` dans les headers
3. **Logout** : `POST /api/logout` révoque le token actuel

Le token est stocké dans `localStorage` côté frontend et automatiquement ajouté aux requêtes.

## 🌐 URLs

- **Frontend :** http://localhost:5173
- **API Backend :** http://localhost:8000
- **WebSocket (Reverb) :** ws://localhost:8080

## 📖 Utilisation

1. **Page d'accueil** : Entrer un pseudo pour accéder au fil
2. **Fil en direct** : Publier des messages (modérés par IA)
3. **Admin** : Se connecter pour gérer les publications
   - Publier / Archiver les messages
   - Copier vers WhatsApp

## 🔧 Configuration OpenAI

L'application utilise un Assistant OpenAI qui doit retourner un JSON :

```json
{
  "approved": true,
  "reason": ""
}
```

ou

```json
{
  "approved": false,
  "reason": "Raison du refus"
}
```

## 🌍 Traduction

Les fichiers de traduction se trouvent dans :
- **Backend :** `backend/lang/{fr,en}/`
- **Frontend :** `frontend/src/i18n.js`

## 📝 Variables d'environnement

### Backend (.env)

```env
# Base
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=sync

# Reverb
REVERB_APP_ID=local
REVERB_APP_KEY=local
REVERB_APP_SECRET=local
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_REVERB_APP_KEY=local
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## 🎨 Charte graphique

- **Primaire :** #6366F1 (Indigo)
- **Succès :** #10B981 (Émeraude)
- **Fond :** #F8FAFC (Gris bleuté)
- **Danger :** #F43F5E (Rose doux)
- **Typographie :** Inter

## 📄 License

MIT
