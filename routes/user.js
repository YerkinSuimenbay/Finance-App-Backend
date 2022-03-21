const express = require('express')
const { updateUserSettings } = require('../controllers/user')
const router = express.Router()

router.patch('/settings', updateUserSettings)

module.exports = router