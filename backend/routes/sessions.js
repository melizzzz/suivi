const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../utils/database');

const router = express.Router();

/**
 * GET /api/sessions
 * Obtenir les séances selon le rôle de l'utilisateur
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sessions;

    if (req.user.role === 'teacher') {
      // Le professeur peut voir toutes les séances
      sessions = await db.read('sessions');
    } else if (req.user.role === 'parent') {
      // Le parent ne peut voir que les séances de ses enfants
      const students = await db.findWhere('students', 
        student => student.parentId === req.user.userId
      );
      const studentIds = students.map(s => s.id);
      
      sessions = await db.findWhere('sessions', 
        session => studentIds.includes(session.studentId)
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Enrichir avec les informations des élèves
    const students = await db.read('students');
    const enrichedSessions = sessions.map(session => {
      const student = students.find(s => s.id === session.studentId);
      return {
        ...session,
        student: student ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        } : null
      };
    });

    res.json({
      success: true,
      sessions: enrichedSessions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/sessions/:id
 * Obtenir une séance spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const session = await db.findById('sessions', req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    // Vérifier les permissions pour les parents
    if (req.user.role === 'parent') {
      const student = await db.findById('students', session.studentId);
      if (!student || student.parentId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
    }

    // Enrichir avec les informations de l'élève
    const student = await db.findById('students', session.studentId);
    const enrichedSession = {
      ...session,
      student: student ? {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName
      } : null
    };

    res.json({
      success: true,
      session: enrichedSession
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/sessions
 * Créer une nouvelle séance (professeur uniquement)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut créer des séances'
      });
    }

    const { studentId, date, duration, subject, price, notes, status = 'completed' } = req.body;

    if (!studentId || !date || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: 'Élève, date, durée et prix sont requis'
      });
    }

    // Vérifier que l'élève existe
    const student = await db.findById('students', studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    const newSession = await db.add('sessions', {
      studentId,
      date: new Date(date).toISOString(),
      duration: parseInt(duration),
      subject: 'Physique', // Matière fixe pour toutes les séances
      price: parseFloat(price),
      notes: notes || '',
      status
    });

    res.status(201).json({
      success: true,
      message: 'Séance créée avec succès',
      session: newSession
    });
  } catch (error) {
    console.error('Erreur lors de la création de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * PUT /api/sessions/:id
 * Mettre à jour une séance (professeur uniquement)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut modifier les séances'
      });
    }

    const { date, duration, subject, price, notes, status } = req.body;

    const updates = {};
    if (date) updates.date = new Date(date).toISOString();
    if (duration) updates.duration = parseInt(duration);
    if (subject) updates.subject = subject;
    if (price) updates.price = parseFloat(price);
    if (notes !== undefined) updates.notes = notes;
    if (status) updates.status = status;

    const updatedSession = await db.update('sessions', req.params.id, updates);

    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Séance mise à jour avec succès',
      session: updatedSession
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Supprimer une séance (professeur uniquement)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut supprimer des séances'
      });
    }

    const deleted = await db.delete('sessions', req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Séance supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/sessions/student/:studentId
 * Obtenir les séances d'un élève spécifique
 */
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Vérifier les permissions
    if (req.user.role === 'parent') {
      const student = await db.findById('students', studentId);
      if (!student || student.parentId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
    }

    const sessions = await db.findWhere('sessions', 
      session => session.studentId === studentId
    );

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des séances de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
