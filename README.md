# 📚 Plateforme de Suivi des Élèves

Application web pour le suivi des cours particuliers, gestion des séances et facturation pour professeurs et parents.

## 🎯 Fonctionnalités

### Interface Professeur
- 👥 **Gestion des élèves** : Ajouter, modifier, consulter les profils
- 📅 **Enregistrement des séances** : Date, durée, matière, prix
- 💰 **Suivi financier** : Calcul automatique des montants dus, historique des paiements
- 📊 **Statistiques** : Revenus mensuels, nombre de séances, élèves actifs
- 📄 **Exports** : Factures PDF, rapports Excel

### Interface Parents
- 👶 **Profil de l'enfant** : Informations et progression
- 📋 **Historique des séances** : Dates, matières, notes du professeur
- 💳 **Facturation** : Montants dus, paiements effectués, échéances
- 📱 **Notifications** : Rappels de paiement, confirmation de séances

## 🛠️ Technologies

- **Backend** : Node.js + Express.js (API REST)
- **Frontend** : React + React Router (SPA)
- **Données** : Fichiers JSON (portable et simple)
- **Authentification** : JWT (JSON Web Tokens)
- **Communication** : Axios pour les appels API
- **UI/UX** : React + CSS/SCSS ou styled-components
- **Déploiement** : Backend (Heroku/Railway) + Frontend (Netlify/Vercel)

## 📁 Structure des données

### Fichiers JSON
- `users.json` : Professeur et parents avec authentification
- `students.json` : Profils des élèves avec informations personnelles
- `sessions.json` : Historique des séances avec détails
- `payments.json` : Suivi des paiements et factures

### Utilisateurs
- Professeur (admin) : accès complet
- Parents (user) : accès limité à leur enfant

### Élèves
- Informations personnelles
- Matières étudiées
- Tarifs personnalisés
- Parent associé

### Séances
- Date et heure
- Durée
- Matière
- Prix
- Notes/commentaires
- Élève concerné

### Paiements
- Montant
- Date
- Statut (payé/en attente)
- Mode de paiement
- Séances concernées

## 🚀 Installation

```bash
# Backend (Node.js + Express)
cd backend
npm init -y
npm install express cors bcrypt jsonwebtoken body-parser
npm install -D nodemon

# Frontend (React)
cd ../frontend
npx create-react-app . --template typescript
npm install axios react-router-dom

# Lancement du développement
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 📋 Roadmap

- [x] ~~Architecture du projet~~
- [ ] Setup Backend Node.js + Express
- [ ] Setup Frontend React
- [ ] Fichiers JSON de données
- [ ] API REST (CRUD élèves, séances, paiements)
- [ ] Authentification JWT
- [ ] Interface React professeur
- [ ] Interface React parents
- [ ] Tests et déploiement
