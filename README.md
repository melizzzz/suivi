# Plateforme de Suivi des Étudiants

Cette application Flask permet aux professeurs de suivre leurs étudiants et de gérer les montants des séances.

## Fonctionnalités Principales

### Gestion des Montants (Prix)
- **Prix par séance**: Chaque étudiant a un prix personnalisé par séance
- **Suivi des paiements**: Montants dus vs montants payés
- **Historique des séances**: Toutes les séances avec leur statut de paiement
- **Vue consolidée**: Résumé financier pour le professeur

### Authentification
- **Professeur**: Gestion complète des étudiants et séances
- **Parents**: Vue en lecture seule des séances et montants de leurs enfants

## Installation

```bash
pip install -r requirements.txt
python setup_test_data.py  # Créer des données de test
python app.py  # Lancer l'application
```

## Comptes de démonstration

- **Professeur**: `teacher` / `password123`
- **Parent**: `parent1` / `parent123`

## Structure des Données

### Étudiant
- Nom
- Parent associé
- **Prix par séance (montant de base)**

### Séance
- Date
- Durée
- **Montant spécifique** (peut différer du prix de base)
- Statut de paiement (payé/non payé)
- Notes

## Démonstration

Pour voir la fonctionnalité montant en action:
```bash
python demo_montant.py
```

Cela affiche:
- Résumé financier par étudiant
- Montants dus vs payés
- Séances non payées nécessitant une action
