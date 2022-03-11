const express = require('express')
const { getAllAccounts, createAccount, getAccount, updateAccount, deleteAccount } = require('../controllers/account')
const router = express.Router()

router.route('/').get(getAllAccounts).post(createAccount)
router.route('/:accountId').get(getAccount).patch(updateAccount).delete(deleteAccount)

module.exports = router