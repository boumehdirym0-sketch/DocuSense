const User = require('../models/user')
const Manual = require('../models/manual')

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count()
    const developers = await User.count({ where: { role: 'developer' } })
    const endusers = await User.count({ where: { role: 'enduser' } })
    const admins = await User.count({ where: { role: 'admin' } })
    const pendingUsers = await User.count({ where: { status: 'pending' } })
    const totalManuals = await Manual.count({ where: { isArchived: false } })
    const publishedManuals = await Manual.count({ where: { isPublished: true, isArchived: false } })
    const archivedManuals = await Manual.count({ where: { isArchived: true } })
    res.json({ totalUsers, developers, endusers, admins, pendingUsers, totalManuals, publishedManuals, archivedManuals })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'] })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: 'pending' },
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    await user.update({ status: 'active' })
    res.json({ message: 'Utilisateur approuvé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const rejectUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    await user.update({ status: 'rejected' })
    res.json({ message: 'Utilisateur refusé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['developer', 'enduser', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' })
    }
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Impossible de modifier votre propre rôle' })
    }
    await user.update({ role })
    res.json({ message: 'Rôle mis à jour', user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' })
    }
    await user.destroy()
    res.json({ message: 'Utilisateur supprimé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllManuals = async (req, res) => {
  try {
    const manuals = await Manual.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json(manuals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteManual = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id)
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    await manual.destroy()
    res.json({ message: 'Manuel supprimé définitivement' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getStats, getAllUsers, getPendingUsers, approveUser, rejectUser, updateUserRole, deleteUser, getAllManuals, deleteManual }
