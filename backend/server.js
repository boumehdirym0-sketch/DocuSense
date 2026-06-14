/**
 * DocuSense - Serveur principal Express
 * Point d'entrée de l'API REST backend.
 * Configure le middleware, les routes et la connexion à la base de données.
 */

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { connectDB, sequelize } = require('./config/db')

dotenv.config()

const app = express()

// Autoriser les requêtes cross-origin depuis le frontend (Vercel + localhost)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true
}))

// Parser les requêtes JSON entrantes
app.use(express.json())

// Charger les modèles Sequelize pour déclencher la synchronisation des tables
require('./models/user')
require('./models/manual')
require('./models/step')
require('./models/quiz')
require('./models/progress')

// Déclaration des routes de l'API
app.use('/api/auth', require('./routes/authRoutes'))       // Authentification (register, login)
app.use('/api/manuals', require('./routes/manualroutes'))  // Gestion des manuels
app.use('/api/ai', require('./routes/aiRoutes'))           // Génération IA (texte, image, vidéo)
app.use('/api/quiz', require('./routes/quizroutes'))       // Quiz et classement
app.use('/api/admin', require('./routes/adminRoutes'))     // Panel administrateur

// Route de vérification de santé du serveur
app.get('/', (req, res) => {
  res.json({ message: 'DocuSense API is running !' })
})

const PORT = process.env.PORT || 5000

/**
 * Démarre le serveur :
 * 1. Connexion à la base de données (PostgreSQL en prod, MySQL en local)
 * 2. Synchronisation des modèles Sequelize (alter:true pour mise à jour sans perte de données)
 * 3. Migration de la colonne 'status' si absente (compatibilité PostgreSQL)
 * 4. Lancement du serveur HTTP
 */
const start = async () => {
  await connectDB()
  await sequelize.sync({ alter: true })

  // Ajout de la colonne 'status' si elle n'existe pas encore (migration sécurisée)
  try {
    const isPostgres = !!process.env.DATABASE_URL
    if (isPostgres) {
      await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'pending'`)
    } else {
      await sequelize.query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'pending'`)
    }
  } catch (e) { /* Colonne déjà existante, on ignore */ }

  console.log('Tables synchronisées !')
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
  })
}

start()