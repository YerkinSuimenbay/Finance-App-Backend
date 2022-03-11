const express = require('express')
const { getAllCategories, createCategory, getCategory, updateCategory, deleteCategory } = require('../controllers/category')
const router = express.Router()

router.route('/').get(getAllCategories).post(createCategory)
router.route('/:categoryId').get(getCategory).patch(updateCategory).delete(deleteCategory)

module.exports = router