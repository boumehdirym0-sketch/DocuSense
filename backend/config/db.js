const { Sequelize } = require('sequelize')
require('dotenv').config()

const isProduction = !!process.env.DATABASE_URL

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
      }
    )

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log(isProduction ? 'PostgreSQL connecté !' : 'MySQL connecté avec succès !')
  } catch (error) {
    console.error('Erreur de connexion DB :', error.message)
  }
}

module.exports = { sequelize, connectDB }