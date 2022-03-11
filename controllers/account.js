const Account = require("../models/Account")
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const getAllAccounts = async (req, res) => {
    const accounts = await Account.find({ createdBy: req.user.userId }).sort('currency')
    res.status(StatusCodes.OK).json({ accounts })
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

    const account = await Account.findOneAndUpdate(
        { _id: accountId, createdBy: userId }, 
        body, 
        { new: true, runValidators: true }
    )

    if (!account) throw new NotFoundError(`No category with id ${accountId}`)

    res.status(StatusCodes.OK).json({ account })
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