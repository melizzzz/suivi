# Suivi des Élèves

Une plateforme web de suivi des cours particuliers permettant aux professeurs de gérer leurs élèves et aux parents de suivre les progrès et les paiements de leurs enfants.

## Fonctionnalités

### Pour les Professeurs
- 👥 **Gestion des élèves** : Ajout et suivi de tous les élèves inscrits
- 📅 **Enregistrement des séances** : Création de séances avec date, matière, durée et prix
- 💰 **Suivi des paiements** : Marquer les séances comme payées ou impayées
- 📊 **Tableau de bord** : Vue d'ensemble avec statistiques (total élèves, sessions, montants)
- 📝 **Notes pédagogiques** : Ajout de notes pour chaque séance

### Pour les Parents
- 👶 **Suivi des enfants** : Accès aux informations de tous leurs enfants inscrits
- 💳 **Gestion financière** : Vue détaillée des montants dus et payés
- 📈 **Historique complet** : Accès à toutes les séances avec détails
- 🔍 **Transparence totale** : Consultation des notes du professeur

## Installation

1. Cloner le repository
```bash
git clone https://github.com/melizzzz/suivi.git
cd suivi
```

2. Installer les dépendances
```bash
pip install -r requirements.txt
```

3. Lancer l'application
```bash
python app.py
```

4. Ouvrir le navigateur sur `http://127.0.0.1:5000`

## Utilisation

### Première connexion
1. **Compte professeur par défaut** : `teacher` / `password`
2. **Inscription parent** : Créer un compte avec l'email que le professeur utilisera

### Workflow typique
1. Le parent s'inscrit sur la plateforme
2. Le professeur ajoute l'élève en utilisant l'email du parent
3. Le professeur enregistre les séances au fur et à mesure
4. Le parent peut consulter en temps réel les séances et montants dus

## Technologies utilisées
- **Backend** : Flask (Python)
- **Base de données** : SQLite avec SQLAlchemy
- **Frontend** : HTML5, Bootstrap 5, CSS personnalisé
- **Authentification** : Flask-Login avec gestion des rôles

## Structure des données
- **Utilisateurs** : Professeurs et parents avec authentification
- **Élèves** : Liés à un parent spécifique
- **Sessions** : Avec prix, matière, notes et statut de paiement

## Sécurité
- Authentification requise pour tous les accès
- Séparation des rôles (professeur/parent)
- Accès restreint : parents ne voient que leurs enfants
