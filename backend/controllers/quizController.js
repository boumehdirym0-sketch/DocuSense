const Quiz = require('../models/Quiz')
const Progress = require('../models/Progress')
const User = require('../models/User')

const createQuiz = async (req, res) => {
  try {
    const { question, options, correctAnswer, points, stepId } = req.body
    const quiz = await Quiz.create({
      question, options, correctAnswer, points, stepId
    })
    res.status(201).json(quiz)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const submitAnswer = async (req, res) => {
  try {
    const { quizId, answer } = req.body
    const quiz = await Quiz.findByPk(quizId)
    if (!quiz) return res.status(404).json({ message: 'Quiz non trouvé' })

    const isCorrect = quiz.correctAnswer === answer
    const pointsEarned = isCorrect ? quiz.points : 0

    let progress = await Progress.findOne({
      where: { userId: req.user.id, manualId: req.body.manualId }
    })

    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        manualId: req.body.manualId,
        score: 0,
        completedSteps: [],
        badges: []
      })
    }

    const newScore = progress.score + pointsEarned
    const completedSteps = [...(progress.completedSteps || []), quizId]

    let badges = [...(progress.badges || [])]
    if (newScore >= 50 && !badges.includes('bronze')) badges.push('bronze')
    if (newScore >= 100 && !badges.includes('silver')) badges.push('silver')
    if (newScore >= 200 && !badges.includes('gold')) badges.push('gold')

    await progress.update({
      score: newScore,
      completedSteps,
      badges
    })

    res.json({
      isCorrect,
      pointsEarned,
      totalScore: newScore,
      badges
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Progress.findAll({
      order: [['score', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['name'] }]
    })
    res.json(leaderboard)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createQuiz, submitAnswer, getLeaderboard }