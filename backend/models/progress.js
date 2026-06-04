const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const User = require('./User')
const Manual = require('./Manual')

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completedSteps: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
})

// Un progress appartient à un utilisateur et un manuel
Progress.belongsTo(User, { foreignKey: 'userId' })
Progress.belongsTo(Manual, { foreignKey: 'manualId' })

module.exports = Progress