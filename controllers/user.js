const User = require("../models/User")
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors")

const updateUserSettings = async (req, res) => {
    const { 
        user: { userId }, 
        body
    } = req

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError(`No user with id ${userId}`)

    user.settings = { ...user.settings, ...body }
    await user.save()

    res.status(StatusCodes.OK).json({ user })
}

module.exports = {
    updateUserSettings,
}