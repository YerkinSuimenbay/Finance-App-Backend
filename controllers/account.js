const Account = require("../models/Account")
const Transaction = require("../models/Transaction") 
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const getAllAccounts = async (req, res) => {
    const accounts = await Account.find({ createdBy: req.user.userId }).sort('currency')

    const KZTExchangeRates = {
        RUB: 5.6,
        USD: 550
    }
    const total = accounts.reduce((accumulator, currentValue) => {
        if (currentValue.currency === "RUB") return accumulator += currentValue.totalCash * KZTExchangeRates.RUB
        if (currentValue.currency === "USD") return accumulator += currentValue.totalCash * KZTExchangeRates.USD
        return accumulator += currentValue.totalCash
    }, 0)
    res.status(StatusCodes.OK).json({ accounts, total })
}
const createAccount = async (req, res) => {
    req.body.createdBy = req.user.userId
    
    const accountAlreadyExists = await Account.findOne({ 
        name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
        createdBy: req.body.createdBy 
    })
    if (accountAlreadyExists) throw new BadRequestError(`Account with name ${req.body.name} already exists!`)

    const account = await Account.create(req.body)
    res.status(StatusCodes.CREATED).json({ account })
}
const getAccount = async (req, res) => {
    const { 
        user: { userId }, 
        params: { accountId } 
    } = req
    
    const account = await Account.findOne({ _id: accountId, createdBy: userId })

    if (!account) throw new NotFoundError(`No category with id ${accountId}`)

    res.status(StatusCodes.OK).json({ account })
}
const updateAccount = async (req, res) => {
    const { 
        user: { userId }, 
        params: { accountId }, 
        body
    } = req

    const accountAlreadyExists = await Account.findOne({ 
        name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
        createdBy: req.body.createdBy,
        _id: { $ne: accountId }  
    })
    if (accountAlreadyExists) throw new BadRequestError(`Account with name ${req.body.name} already exists!`)

    // const account = await Account.findOneAndUpdate(
    //     { _id: accountId, createdBy: userId }, 
    //     body, 
    //     { new: true, runValidators: true }
    // )
    const account = await Account.findOne({ _id: accountId, createdBy: userId })
    if (!account) throw new NotFoundError(`No category with id ${accountId}`)

    account.totalCash = body.totalCash
    account.name = body.name
    account.icon = body.icon
    account.color = body.color
    account.currency = body.currency
    account.createdBy = body.createdBy

    const [updatedAccount, updatedTransactions] = await Promise.all([
        account.save(),
        Transaction.updateMany(
            { 
                name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
                createdBy: req.body.createdBy
            },
            { currency: body.currency },
        )
    ])

    // await Transaction.updateMany(
    //     { 
    //         name: { $regex: new RegExp("^" + req.body.name + "$", "i") }, 
    //         createdBy: req.body.createdBy
    //     },
    //     // {
    //     //     $set: { currency: body.currency }
    //     // },
    //     { currency: body.currency },
    // )

    res.status(StatusCodes.OK).json({ account: updatedAccount })
}
const deleteAccount = async (req, res) => {
    const { 
        user: { userId }, 
        params: { accountId } 
    } = req

    const account = await Account.findOneAndDelete({ _id: accountId, createdBy: userId })

    if (!account) throw new NotFoundError(`No category with id ${accountId}`)

    res.status(StatusCodes.OK).json({ account })
}

module.exports = {
    getAllAccounts,
    createAccount,
    getAccount,
    updateAccount,
    deleteAccount,
}