/**
 * Contrôleur d'authentification - DocuSense
 * Gère l'inscription, la connexion, la vérification de statut et le profil utilisateur.
 * Utilise JWT (30 jours) pour les tokens et bcryptjs pour le hachage des mots de passe.
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

/**
 * Génère un token JWT signé contenant l'id et le rôle de l'utilisateur.
 * Expiration : 30 jours.
 */
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur avec le statut 'pending'.
 * Aucun token n'est retourné — l'accès est bloqué jusqu'à validation par l'admin.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Vérifier si l'email est déjà utilisé
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé' })

    // Hacher le mot de passe avec un salt de 10 itérations
    const hashed = await bcrypt.hash(password, 10)

    // Seuls les rôles developer et enduser sont autorisés à l'inscription publique
    const allowedRoles = ['developer', 'enduser']
    const role = allowedRoles.includes(req.body.role) ? req.body.role : 'developer'

    await User.create({ name, email, password: hashed, role, status: 'pending' })

    res.status(201).json({
      message: 'Compte créé avec succès. Veuillez patienter que votre compte soit validé par un administrateur.',
      status: 'pending',
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * POST /api/auth/login
 * Authentifie un utilisateur et retourne un token JWT.
 * Bloque les comptes en attente (pending) ou refusés (rejected).
 * Les administrateurs contournent la vérification de statut.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email incorrect' })

    // Comparer le mot de passe avec le hash stocké
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Mot de passe incorrect' })

    // Vérification du statut (sauf pour les admins)
    if (user.role !== 'admin') {
      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Votre compte est en attente de validation par un administrateur.' })
      }
      if (user.status === 'rejected') {
        return res.status(403).json({ message: 'Votre compte a été refusé. Contactez l\'administrateur.' })
      }
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/auth/status?email=...
 * Permet à un utilisateur en attente de vérifier si son compte a été approuvé.
 * Si approuvé, retourne un token JWT pour connexion automatique.
 * Utilisé par le polling côté frontend (toutes les 4 secondes).
 */
const checkStatus = async (req, res) => {
  try {
    const { email } = req.query
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })

    if (user.status === 'active') {
      // Retourner le token pour connexion automatique après approbation
      return res.json({
        status: 'active',
        token: generateToken(user.id, user.role),
        name: user.name,
        email: user.email,
        role: user.role,
      })
    }
    res.json({ status: user.status })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur connecté (protégé par JWT).
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role'] })
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login, getMe, checkStatus }
