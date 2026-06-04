const Manual = require('../models/Manual')
const Step = require('../models/Step')
const Quiz = require('../models/Quiz')

const getPublishedManuals = async (req, res) => {
  try {
    const manuals = await Manual.findAll({
      where: { isPublished: true, isArchived: false },
      include: [{ model: Step, include: [Quiz] }]
    })
    res.json(manuals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getManuals = async (req, res) => {
  try {
    const manuals = await Manual.findAll({
      where: { authorId: req.user.id, isArchived: false }
    })
    res.json(manuals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getArchivedManuals = async (req, res) => {
  try {
    const manuals = await Manual.findAll({
      where: { authorId: req.user.id, isArchived: true }
    })
    res.json(manuals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createManual = async (req, res) => {
  try {
    const { title, description } = req.body
    const manual = await Manual.create({
      title,
      description,
      authorId: req.user.id
    })
    res.status(201).json(manual)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getManualById = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id, {
      include: [Step]
    })
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    res.json(manual)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateManual = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id)
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    await manual.update(req.body)
    res.json(manual)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const archiveManual = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id)
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    await manual.update({ isArchived: true, isPublished: false })
    res.json({ message: 'Manuel archivé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const restoreManual = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id)
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    await manual.update({ isArchived: false })
    res.json({ message: 'Manuel restauré' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const permanentDeleteManual = async (req, res) => {
  try {
    const manual = await Manual.findByPk(req.params.id)
    if (!manual) return res.status(404).json({ message: 'Manuel non trouvé' })
    const steps = await Step.findAll({ where: { manualId: manual.id } })
    const stepIds = steps.map(s => s.id)
    if (stepIds.length > 0) await Quiz.destroy({ where: { stepId: stepIds } })
    await Step.destroy({ where: { manualId: manual.id } })
    await manual.destroy()
    res.json({ message: 'Manuel supprimé définitivement' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const saveSteps = async (req, res) => {
  console.log('=== saveSteps appelé ===')
  console.log('manualId:', req.params.id)
  console.log('nb steps:', req.body?.steps?.length)
  try {
    const { steps } = req.body
    const manualId = req.params.id

    const existingSteps = await Step.findAll({ where: { manualId } })
    const existingIds = existingSteps.map(s => s.id)
    if (existingIds.length > 0) {
      await Quiz.destroy({ where: { stepId: existingIds } })
    }
    await Step.destroy({ where: { manualId } })

    const toStr = (v) => {
      if (v === null || v === undefined) return ''
      if (Array.isArray(v)) return v.join(' ')
      if (typeof v === 'object') return Object.values(v).join(' ')
      return String(v)
    }

    const result = []
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      console.log(`Step ${i} raw:`, JSON.stringify(s).slice(0, 200))
      const step = await Step.create({
        title: toStr(s.title),
        description: toStr(s.description),
        type: 'text',
        order: i,
        manualId
      })
      if (s.quiz && s.quiz.question) {
        const options = Array.isArray(s.quiz.options)
          ? s.quiz.options.map(toStr)
          : [toStr(s.quiz.options)]
        await Quiz.create({
          question: toStr(s.quiz.question),
          options,
          correctAnswer: toStr(s.quiz.correctAnswer),
          points: parseInt(s.quiz.points) || 10,
          stepId: step.id
        })
      }
      result.push(step)
    }
    res.json(result)
  } catch (err) {
    console.error('saveSteps error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getManuals, getPublishedManuals, createManual, getManualById,
  updateManual, archiveManual, restoreManual, permanentDeleteManual,
  getArchivedManuals, saveSteps
}
