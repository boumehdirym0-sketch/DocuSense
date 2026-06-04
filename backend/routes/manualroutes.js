const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getManuals,
  getPublishedManuals,
  createManual,
  getManualById,
  updateManual,
  archiveManual,
  restoreManual,
  permanentDeleteManual,
  getArchivedManuals,
  saveSteps
} = require('../controllers/manualcontroller')

router.get('/published', protect, getPublishedManuals)
router.get('/archived', protect, getArchivedManuals)

router.route('/')
  .get(protect, getManuals)
  .post(protect, createManual)

router.post('/:id/steps', protect, saveSteps)
router.post('/:id/restore', protect, restoreManual)
router.delete('/:id/permanent', protect, permanentDeleteManual)

router.route('/:id')
  .get(protect, getManualById)
  .put(protect, updateManual)
  .delete(protect, archiveManual)

module.exports = router
