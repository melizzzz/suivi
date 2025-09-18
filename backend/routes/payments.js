const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../utils/database');

const router = express.Router();

/**
 * GET /api/payments
 * Obtenir les paiements selon le rôle de l'utilisateur
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    let payments;

    if (req.user.role === 'teacher') {
      // Le professeur peut voir tous les paiements
      payments = await db.read('payments');
    } else if (req.user.role === 'parent') {
      // Le parent ne peut voir que les paiements de ses enfants
      const students = await db.findWhere('students', 
        student => student.parentId === req.user.userId
      );
      const studentIds = students.map(s => s.id);
      
      payments = await db.findWhere('payments', 
        payment => studentIds.includes(payment.studentId)
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Enrichir avec les informations des élèves
    const students = await db.read('students');
    const enrichedPayments = payments.map(payment => {
      const student = students.find(s => s.id === payment.studentId);
      return {
        ...payment,
        student: student ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        } : null
      };
    });

    res.json({
      success: true,
      payments: enrichedPayments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/payments/:id
 * Obtenir un paiement spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await db.findById('payments', req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Vérifier les permissions pour les parents
    if (req.user.role === 'parent') {
      const student = await db.findById('students', payment.studentId);
      if (!student || student.parentId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
    }

    // Enrichir avec les informations de l'élève
    const student = await db.findById('students', payment.studentId);
    const enrichedPayment = {
      ...payment,
      student: student ? {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName
      } : null
    };

    res.json({
      success: true,
      payment: enrichedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/payments
 * Créer un nouveau paiement (professeur uniquement)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut créer des paiements'
      });
    }

    const { studentId, amount, sessionIds, status = 'pending', paymentMethod, dueDate } = req.body;

    if (!studentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Élève et montant sont requis'
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

    const newPayment = await db.add('payments', {
      studentId,
      amount: parseFloat(amount),
      sessionIds: sessionIds || [],
      status,
      paymentMethod: paymentMethod || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      paidDate: status === 'paid' ? new Date().toISOString() : null
    });

    res.status(201).json({
      success: true,
      message: 'Paiement créé avec succès',
      payment: newPayment
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * PUT /api/payments/:id
 * Mettre à jour un paiement (professeur uniquement)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut modifier les paiements'
      });
    }

    const { amount, sessionIds, status, paymentMethod, dueDate } = req.body;

    const updates = {};
    if (amount) updates.amount = parseFloat(amount);
    if (sessionIds) updates.sessionIds = sessionIds;
    if (status) {
      updates.status = status;
      if (status === 'paid' && !updates.paidDate) {
        updates.paidDate = new Date().toISOString();
      } else if (status !== 'paid') {
        updates.paidDate = null;
      }
    }
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (dueDate) updates.dueDate = new Date(dueDate).toISOString();

    const updatedPayment = await db.update('payments', req.params.id, updates);

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Paiement mis à jour avec succès',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * DELETE /api/payments/:id
 * Supprimer un paiement (professeur uniquement)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut supprimer des paiements'
      });
    }

    const deleted = await db.delete('payments', req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Paiement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/payments/student/:studentId
 * Obtenir les paiements d'un élève spécifique
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

    const payments = await db.findWhere('payments', 
      payment => payment.studentId === studentId
    );

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/payments/:id/mark-paid
 * Marquer un paiement comme payé (professeur uniquement)
 */
router.post('/:id/mark-paid', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seul le professeur peut marquer les paiements comme payés'
      });
    }

    const { paymentMethod } = req.body;

    const updatedPayment = await db.update('payments', req.params.id, {
      status: 'paid',
      paymentMethod: paymentMethod || 'Non spécifié',
      paidDate: new Date().toISOString()
    });

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Paiement marqué comme payé',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors du marquage du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
