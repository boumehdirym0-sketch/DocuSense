const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { getStats, getAllUsers, getPendingUsers, approveUser, rejectUser, updateUserRole, deleteUser, getAllManuals, deleteManual } = require('../controllers/adminController')

router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.get('/users/pending', getPendingUsers)
router.put('/users/:id/approve', approveUser)
router.put('/users/:id/reject', rejectUser)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/manuals', getAllManuals)
router.delete('/manuals/:id', deleteManual)

module.exports = router
