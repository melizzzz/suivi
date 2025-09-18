const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../utils/database');

const router = express.Router();

/**
 * GET /api/classes
 * Obtenir toutes les classes (professeur uniquement)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut voir les classes'
      });
    }

    const classes = await db.read('classes');ire('express');
const { authenticateToken } = require('./auth');
const db = require('../utils/database');

const router = express.Router();

/**
 * GET /api/groups
 * Obtenir tous les groupes (professeur uniquement)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut voir les groupes'
      });
    }

    const classes = await db.read('classes');
    
    // Enrichir avec les informations des élèves
    const students = await db.read('students');
    const enrichedClasses = classes.map(classItem => {
      const classStudents = classItem.studentIds.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return student ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        } : null;
      }).filter(s => s !== null);

      return {
        ...classItem,
        students: classStudents
      };
    });

    res.json({
      success: true,
      classes: enrichedClasses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/classes
 * Créer une nouvelle classe (professeur uniquement)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut créer des classes'
      });
    }

    const { name, studentIds, hourlyRate, description } = req.body;

    if (!name || !studentIds || !Array.isArray(studentIds) || studentIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Nom de classe et au moins 2 élèves sont requis'
      });
    }

    // Vérifier que tous les élèves existent
    const students = await db.read('students');
    const validStudentIds = studentIds.filter(id => 
      students.some(student => student.id === id)
    );

    if (validStudentIds.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Certains élèves sélectionnés n\'existent pas'
      });
    }

    const newClass = await db.add('classes', {
      name,
      studentIds: validStudentIds,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 20, // Tarif par défaut
      description: description || '',
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      class: newClass
    });
  } catch (error) {
    console.error('Erreur lors de la création de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * PUT /api/classes/:id
 * Mettre à jour une classe (professeur uniquement)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut modifier les classes'
      });
    }

    const { name, studentIds, hourlyRate, description, active } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (studentIds && Array.isArray(studentIds)) updates.studentIds = studentIds;
    if (hourlyRate) updates.hourlyRate = parseFloat(hourlyRate);
    if (description !== undefined) updates.description = description;
    if (typeof active === 'boolean') updates.active = active;

    const updatedClass = await db.update('classes', req.params.id, updates);

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Classe mise à jour avec succès',
      class: updatedClass
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * DELETE /api/classes/:id
 * Supprimer une classe (professeur uniquement)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut supprimer des classes'
      });
    }

    const deleted = await db.delete('classes', req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Classe supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
