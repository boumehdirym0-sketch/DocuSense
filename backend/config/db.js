const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
)

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('MySQL connecté avec succès !')
  } catch (error) {
    console.error('Erreur de connexion MySQL :', error.message)
  }
}

module.exports = { sequelize, connectDB }