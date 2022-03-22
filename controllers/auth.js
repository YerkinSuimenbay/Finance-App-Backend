const User = require("../models/User")
const Category = require("../models/Category")
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors")

const categoriesJSON = require('../utils/categories.json')

const register = async (req, res) => {
    req.body.settings = {
        app_language: 'Русский',
        default_account: '',
        default_period: 'Day',
    }
    const user = await User.create(req.body)

    const basicCategories = categoriesJSON.map(category => ({ ...category, createdBy: user._id }))

    for( var i = 0; i < basicCategories.length; i++ ) {
		new Category( basicCategories[ i ] ).save();
	}
    // const categories = Category(basicCategories)
    // console.log({categoriesJSON, basicCategories, categories});
    // await categories.save()

    const token = user.generateToken()

    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email, settings: user.settings }, token })
}
const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) throw new BadRequestError('Please provide email and password')

    const user = await User.findOne({ email })
    if (!user) throw new UnauthenticatedError('Invalid credentials _eml_')

    const correctPassword = await user.checkPassword(password)
    if (!correctPassword) throw new UnauthenticatedError('Invalid credentials _pwd_')

    const token = user.generateToken()
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email, settings: user.settings }, token })
}

const deleteAccount = async (req, res) => {
    const user = await User.findByIdAndDelete(req.user.userId)
    if (!user) throw new NotFoundError(`No user with id ${req.body.userId}`)
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email } })
}

module.exports = {
    register,
    login,
    deleteAccount
}