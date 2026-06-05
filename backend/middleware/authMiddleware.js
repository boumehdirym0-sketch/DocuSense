const jwt = require('jsonwebtoken')
const User = require('../models/user')

const protect = async (req, res, next) => {
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

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
  }
  next()
}

module.exports = { protect, adminOnly }