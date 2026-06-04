const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const Manual = require('./manual')

const Step = sequelize.define('Step', {
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
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('text', 'video', 'quiz'),
    defaultValue: 'text',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
})

// Une étape appartient à un manuel
Step.belongsTo(Manual, { foreignKey: 'manualId' })
Manual.hasMany(Step, { foreignKey: 'manualId' })

module.exports = Step