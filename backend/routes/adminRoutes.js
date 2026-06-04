const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { getStats, getAllUsers, updateUserRole, deleteUser, getAllManuals, deleteManual } = require('../controllers/adminController')

router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/manuals', getAllManuals)
router.delete('/manuals/:id', deleteManual)

module.exports = router
