const express = require('express')
const { register, login, deleteAccount } = require('../controllers/auth')
const { updateUserSettings } = require('../controllers/user')
const router = express.Router()

const authenticateUser = require('../middleware/authentication')

router.post('/register', register)
router.post('/login', login)
router.delete('/', authenticateUser, deleteAccount)

router.patch('/settings', updateUserSettings)

module.exports = router