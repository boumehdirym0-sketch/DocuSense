/**
 * Modèle Sequelize - Utilisateur
 * Représente un compte utilisateur sur la plateforme DocuSense.
 * Trois rôles possibles : developer (créateur de manuels), enduser (lecteur), admin.
 * Le statut contrôle l'accès : pending (en attente), active (approuvé), rejected (refusé).
 */

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // Mot de passe haché avec bcryptjs (salt=10)
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Rôle de l'utilisateur sur la plateforme
  role: {
    type: DataTypes.ENUM('developer', 'enduser', 'admin'),
    defaultValue: 'developer',
  },
  // Statut du compte : pending par défaut, activé après validation admin
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
})

module.exports = User