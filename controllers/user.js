const User = require("../models/User")
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors")
const Transaction = require("../models/Transaction")
const Category = require("../models/Category")
const Account = require("../models/Account")

const updateUserSettings = async (req, res) => {
    const { 
        user: { userId }, 
        body
    } = req

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError(`No user with id ${userId}`)

    user.settings = { ...user.settings, ...body }
    await user.save()

    res.status(StatusCodes.OK).json({ name: user.name, email: user.email, settings: user.settings })
}
const updateUserPassword = async (req, res) => {
    const { 
        user: { userId }, 
        body: { oldPwd, newPwd, repeatPwd }
    } = req

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError(`No user with id ${userId}`)

    const correctPassword = await user.checkPassword(oldPwd)
    if (!correctPassword) throw new BadRequestError('Old password is not correct')

    if (oldPwd === newPwd) throw new BadRequestError('New password cannot be equal to old password')
    if (repeatPwd !== newPwd) throw new BadRequestError('Repeat password not equal to new password')


    user.password = await user.hashPassword(newPwd)
    await user.save()

    res.status(StatusCodes.OK).json({ name: user.name, email: user.email, settings: user.settings })
}

const deleteAllData = async (req, res) => {
    const { userId } = req.user

    const transaction = await Transaction.deleteMany({ createdBy: userId })
    const category = await Category.deleteMany({ createdBy: userId })
    const account = await Account.deleteMany({ createdBy: userId })

    const [accounts, categories, transactions] = await Promise.all([
        Account.deleteMany({ createdBy: userId }),
        Category.deleteMany({ createdBy: userId }),
        Transaction.deleteMany({ createdBy: userId }),
    ])

    // if (!accounts) throw new NotFoundError(`No category with id ${accountId}`)
    // if (!categories) throw new NotFoundError(`No category with id ${categoryId}`)
    // if (!transactions) throw new NotFoundError(`No transaction with id ${transactionId}`)

    res.status(StatusCodes.OK).json({  })
}

module.exports = {
    updateUserSettings,
    updateUserPassword,
    deleteAllData,
}