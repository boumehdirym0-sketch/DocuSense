/**
 * Middleware d'authentification et d'autorisation - DocuSense
 * protect   : vérifie le token JWT dans l'en-tête Authorization
 * adminOnly : restreint l'accès aux utilisateurs ayant le rôle 'admin'
 */

const jwt = require('jsonwebtoken')
const User = require('../models/user')

/**
 * Middleware protect : extrait et vérifie le token JWT Bearer.
 * Injecte l'objet utilisateur dans req.user si le token est valide.
 */
const protect = async (req, res, next) => {
  // Le token est envoyé dans l'en-tête : Authorization: Bearer <token>
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'role'] })
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' })
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' })
  }
}

/**
 * Middleware adminOnly : bloque l'accès aux non-administrateurs.
 * Doit être utilisé après le middleware protect.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
  }
  next()
}

module.exports = { protect, adminOnly }