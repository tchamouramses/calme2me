#!/bin/bash
# Script de configuration des domaines locaux pour calme2me

set -e

OS=$(uname -s)

echo "🔗 Configuration des domaines pour calme2me"
echo "==========================================="
echo ""

if [ "$OS" == "Darwin" ]; then
    HOSTS_FILE="/etc/hosts"
    EDITOR="nano"
elif [ "$OS" == "Linux" ]; then
    HOSTS_FILE="/etc/hosts"
    EDITOR="nano"
elif [ "$OS" == "MSYS" ] || [ "$OS" == "MINGW64_NT" ]; then
    HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"
    EDITOR="notepad"
else
    echo "⚠️  OS not recognized. Please edit /etc/hosts manually."
    exit 1
fi

echo "Système d'exploitation: $OS"
echo "Fichier hosts: $HOSTS_FILE"
echo ""

# Configuration par environnement
DEVELOPMENT_ENTRIES="
127.0.0.1       calme2me.local
127.0.0.1       api.calme2me.local
"

STAGING_ENTRIES="
# Staging entries (remplacer par IP réel du serveur staging)
# 10.0.1.50     calme2me-staging.com
# 10.0.1.50     api-staging.calme2me.com
"

PRODUCTION_ENTRIES="
# Production entries (remplacer par IP réel du serveur production)
# Ces domaines utilisent DNS public, pas besoin de hosts
"

echo "Environnements disponibles:"
echo "1. Development (localhost)"
echo "2. Staging (serveur distant)"
echo "3. Production (DNS public)"
echo ""

read -p "Ajouter domaines pour Development? (y/n) [y]: " ADD_DEV
ADD_DEV=${ADD_DEV:-y}

read -p "Ajouter domaines pour Staging? (y/n) [n]: " ADD_STAGING
ADD_STAGING=${ADD_STAGING:-n}

echo ""
echo "Contenu à ajouter à $HOSTS_FILE:"
echo ""
echo "# calme2me Domains"

if [ "$ADD_DEV" = "y" ]; then
    echo "## Development"
    echo "$DEVELOPMENT_ENTRIES"
fi

if [ "$ADD_STAGING" = "y" ]; then
    echo "## Staging"
    echo "$STAGING_ENTRIES"
fi

echo ""
echo "⚠️  Cette opération nécessite les droits root/admin"
echo ""

if [ "$ADD_DEV" = "y" ] || [ "$ADD_STAGING" = "y" ]; then
    read -p "Procéder? (y/n) [y]: " CONFIRM
    CONFIRM=${CONFIRM:-y}
    
    if [ "$CONFIRM" = "y" ]; then
        # Créer un fichier temporaire
        TEMP_FILE="/tmp/calme2me_hosts.txt"
        
        {
            echo ""
            echo "# calme2me Domains - Added $(date)"
            
            if [ "$ADD_DEV" = "y" ]; then
                echo "## Development"
                echo "$DEVELOPMENT_ENTRIES"
            fi
            
            if [ "$ADD_STAGING" = "y" ]; then
                echo "## Staging"
                echo "$STAGING_ENTRIES"
            fi
        } > "$TEMP_FILE"
        
        # Ajouter au fichier hosts
        if command -v sudo &> /dev/null; then
            cat "$TEMP_FILE" | sudo tee -a "$HOSTS_FILE" > /dev/null
        else
            cat "$TEMP_FILE" >> "$HOSTS_FILE"
        fi
        
        rm "$TEMP_FILE"
        
        echo "✓ Domaines ajoutés au fichier hosts"
    fi
else
    echo "Aucun domaine ajouté."
fi

echo ""
echo "✅ Configuration terminée!"
echo ""

# Vérifier si les domaines résolvent
echo "🔍 Vérification de la résolution DNS..."
echo ""

if nslookup calme2me.local &> /dev/null; then
    echo "✓ calme2me.local résout correctement"
else
    echo "⚠️  calme2me.local ne résout pas (vérifier /etc/hosts)"
fi

if nslookup api.calme2me.local &> /dev/null; then
    echo "✓ api.calme2me.local résout correctement"
else
    echo "⚠️  api.calme2me.local ne résout pas (vérifier /etc/hosts)"
fi

echo ""
echo "📝 Pour modifier manuellement:"
echo "   sudo $EDITOR $HOSTS_FILE"
echo ""
echo "🌐 Domaines après configuration:"
echo "   Frontend:  http://calme2me.local:3000"
echo "   Backend:   http://api.calme2me.local:8000"
echo "   API:       http://api.calme2me.local:8000/api"
