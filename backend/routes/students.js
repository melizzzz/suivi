const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../utils/database');

const router = express.Router();

/**
 * GET /api/students
 * Obtenir tous les élèves (professeur) ou l'élève associé (parent)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      // Le professeur peut voir tous les élèves
      const students = await db.read('students');
      res.json({
        success: true,
        students
      });
    } else if (req.user.role === 'parent') {
      // Le parent ne peut voir que son/ses enfants
      const students = await db.findWhere('students', 
        student => student.parentId === req.user.userId
      );
      res.json({
        success: true,
        students
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/students/:id
 * Obtenir un élève spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await db.findById('students', req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'parent' && student.parentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/students
 * Créer un nouvel élève (professeur uniquement)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut ajouter des élèves'
      });
    }

    const { firstName, lastName, email, phone, subjects, hourlyRate, level, parentId } = req.body;

    if (!firstName || !lastName || !hourlyRate) {
      return res.status(400).json({
        success: false,
        message: 'Prénom, nom et tarif horaire sont requis'
      });
    }

    const newStudent = await db.add('students', {
      firstName,
      lastName,
      email,
      phone,
      subjects: ['Physique'], // Matière fixe pour tous les élèves
      hourlyRate: parseFloat(hourlyRate),
      level: level || '',
      parentId,
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Élève ajouté avec succès',
      student: newStudent
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * PUT /api/students/:id
 * Mettre à jour un élève (professeur uniquement)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut modifier les élèves'
      });
    }

    const { firstName, lastName, email, phone, subjects, hourlyRate, level, parentId, active } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (subjects) updates.subjects = Array.isArray(subjects) ? subjects : [subjects];
    if (hourlyRate) updates.hourlyRate = parseFloat(hourlyRate);
    if (level !== undefined) updates.level = level;
    if (parentId) updates.parentId = parentId;
    if (typeof active === 'boolean') updates.active = active;

    const updatedStudent = await db.update('students', req.params.id, updates);

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Élève mis à jour avec succès',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * DELETE /api/students/:id
 * Supprimer un élève (professeur uniquement)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut supprimer des élèves'
      });
    }

    const deleted = await db.delete('students', req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Élève supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
