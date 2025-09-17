#!/bin/bash

# Script de démarrage pour la plateforme Suivi des Élèves

echo "🎓 Démarrage de la plateforme Suivi des Élèves..."
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "venv" ]; then
    echo "📦 Installation des dépendances..."
    pip3 install -r requirements.txt
fi

echo "🚀 Lancement de l'application..."
echo "📱 L'application sera accessible sur : http://127.0.0.1:5000"
echo ""
echo "👨‍🏫 Compte professeur par défaut :"
echo "   Utilisateur : teacher"
echo "   Mot de passe : password"
echo ""
echo "👪 Pour les parents : créez un compte via l'inscription"
echo ""
echo "⏹️  Pour arrêter l'application : Ctrl+C"
echo ""

python3 app.py