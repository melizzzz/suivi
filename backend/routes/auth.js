const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur
    const users = await db.read('users');
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner les infos utilisateur (sans le mot de passe)
    const { password: _, ...userInfo } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userInfo
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

/**
 * POST /api/auth/register
 * Inscription nouvel utilisateur (parent)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'parent' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const users = await db.read('users');
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = await db.add('users', {
      email,
      password: hashedPassword,
      name,
      role
    });

    // Retourner les infos utilisateur (sans le mot de passe)
    const { password: _, ...userInfo } = newUser;

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userInfo
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token d\'accès requis' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
    req.user = user;
    next();
  });
};

/**
 * GET /api/auth/me
 * Obtenir les informations de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findById('users', req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const { password: _, ...userInfo } = user;
    res.json({
      success: true,
      user: userInfo
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

module.exports = { router, authenticateToken };
