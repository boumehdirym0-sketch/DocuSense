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
app.use('/api/manuals', require('./routes/manualroutes'))
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/quiz', require('./routes/quizroutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.get('/', (req, res) => {
  res.json({ message: 'DocuSense API is running !' })
})

app.get('/api/setup-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const User = require('./models/user')
    const exists = await User.findOne({ where: { email: 'admin@docusense.com' } })
    if (exists) return res.json({ message: 'Admin déjà créé', email: 'admin@docusense.com' })
    const hashed = await bcrypt.hash('boumehdi123', 10)
    await User.create({ name: 'Admin', email: 'admin@docusense.com', password: hashed, role: 'admin' })
    res.json({ message: 'Admin créé avec succès', email: 'admin@docusense.com' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
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