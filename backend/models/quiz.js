const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const Step = require('./step')

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
})

// Un quiz appartient à une étape
Quiz.belongsTo(Step, { foreignKey: 'stepId' })
Step.hasOne(Quiz, { foreignKey: 'stepId' })

module.exports = Quiz