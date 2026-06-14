const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé' })

    const hashed = await bcrypt.hash(password, 10)
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email incorrect' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Mot de passe incorrect' })

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

const checkStatus = async (req, res) => {
  try {
    const { email } = req.query
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    if (user.status === 'active') {
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
