const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { createQuiz, submitAnswer, getLeaderboard } = require('../controllers/quizController')

router.post('/create', protect, createQuiz)
router.post('/submit', protect, submitAnswer)
router.get('/leaderboard', protect, getLeaderboard)

module.exports = router