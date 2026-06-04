const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect } = require('../middleware/authMiddleware')
const { suggestSteps, analyzeImage, analyzeVideo, analyzeImageStep } = require('../controllers/aiController')

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
})

router.post('/suggest', protect, suggestSteps)
router.post('/analyze-image', protect, upload.single('image'), analyzeImage)
router.post('/analyze-video', protect, upload.single('video'), analyzeVideo)
router.post('/analyze-image-step', protect, upload.single('image'), analyzeImageStep)

module.exports = router