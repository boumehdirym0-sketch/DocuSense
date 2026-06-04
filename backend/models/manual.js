const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const User = require('./User')

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