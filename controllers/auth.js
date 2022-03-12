const User = require("../models/User")
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors")


const register = async (req, res) => {
    const user = await User.create(req.body)

    const token = user.generateToken()
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email }, token })
}
const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) throw new BadRequestError('Please provide email and password')

    const user = await User.findOne({ email })
    if (!user) throw new UnauthenticatedError('Invalid credentials _eml_')

    const correctPassword = user.checkPassword(password)
    if (!correctPassword) throw new UnauthenticatedError('Invalid credentials _pwd_')

    const token = user.generateToken()
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email }, token })
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