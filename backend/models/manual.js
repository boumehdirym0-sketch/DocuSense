/**
 * Modèle Sequelize - Manuel
 * Représente un manuel de documentation créé par un développeur.
 * Un manuel contient plusieurs étapes (Steps), chacune avec un quiz associé.
 * Il peut être en brouillon, publié (visible aux utilisateurs finaux) ou archivé.
 */

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const User = require('./user')

const Manual = sequelize.define('Manual', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
})

// Un utilisateur peut avoir plusieurs manuels
Manual.belongsTo(User, { foreignKey: 'authorId' })
User.hasMany(Manual, { foreignKey: 'authorId' })

module.exports = Manual