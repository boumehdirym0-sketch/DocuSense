const express = require('express')
const router = express.Router()
const { register, login, getMe, checkStatus } = require('../controllers/authcontroller')
const { protect } = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/status', checkStatus)

module.exports = router
