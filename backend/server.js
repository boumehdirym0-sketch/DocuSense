const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { connectDB, sequelize } = require('./config/db')

dotenv.config()

const app = express()
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())

// Importer les modèles
require('./models/user')
require('./models/manual')
require('./models/step')
require('./models/quiz')
require('./models/progress')

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/manuals', require('./routes/manualRoutes'))
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/quiz', require('./routes/quizRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.get('/', (req, res) => {
  res.json({ message: 'DocuSense API is running !' })
})

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  await sequelize.sync()
  console.log('Tables synchronisées !')
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
  })
}

start()