const Category = require("../models/Category")
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const getAllCategories = async (req, res) => {
    const { type } = req.query

    const queryObject = { createdBy: req.user.userId }
    if (type) queryObject.type = type

    const categories = await Category.find(queryObject).sort('type')
    res.status(StatusCodes.OK).json({ categories })
}
const createCategory = async (req, res) => {
    req.body.createdBy = req.user.userId

    const categoryAlreadyExists = await Category.findOne({ 
        name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
        createdBy: req.body.createdBy 
    })
    if (categoryAlreadyExists) throw new BadRequestError(`Category with name ${req.body.name} already exists!`)

    const category = await Category.create(req.body)
    res.status(StatusCodes.CREATED).json({ category })
}
const getCategory = async (req, res) => {
    const { 
        user: { userId }, 
        params: { categoryId } 
    } = req
    
    const category = await Category.findOne({ _id: categoryId, createdBy: userId })

    if (!category) throw new NotFoundError(`No category with id ${categoryId}`)

    res.status(StatusCodes.OK).json({ category })
}
const updateCategory = async (req, res) => {
    const { 
        user: { userId }, 
        params: { categoryId }, 
        body
    } = req

    const categoryAlreadyExists = await Category.findOne({ 
        name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
        createdBy: req.body.createdBy,
        _id: { $ne: categoryId } 
    })
    if (categoryAlreadyExists) throw new BadRequestError(`Category with name ${req.body.name} already exists!`)

    const category = await Category.findOneAndUpdate(
        { _id: categoryId, createdBy: userId }, 
        body, 
        { new: true, runValidators: true }
    )

    if (!category) throw new NotFoundError(`No category with id ${categoryId}`)

    res.status(StatusCodes.OK).json({ category })
}
const deleteCategory = async (req, res) => {
    const { 
        user: { userId }, 
        params: { categoryId } 
    } = req

    const category = await Category.findOneAndDelete({ _id: categoryId, createdBy: userId })

    if (!category) throw new NotFoundError(`No category with id ${categoryId}`)
    
    res.status(StatusCodes.OK).json({ category })
}

module.exports = {
    getAllCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
}