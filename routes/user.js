const express = require('express')
const { updateUserSettings, updateUserPassword, deleteAllData } = require('../controllers/user')
const router = express.Router()

router.patch('/settings', updateUserSettings)
router.patch('/password', updateUserPassword)
router.delete('/deleteAllData', deleteAllData)

module.exports = router