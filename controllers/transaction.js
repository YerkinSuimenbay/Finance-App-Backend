const Transaction = require("../models/Transaction")
const Account = require("../models/Account")
const Category = require("../models/Category")

const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const groupTransactionsByCategory = async (transactions, createdBy) => {
    const allCategories = transactions.reduce((acc, curr) => {
      if (!acc.includes(curr.category)) acc.push(curr.category)
      return acc
    }, [])
    const dbAllCategories = await Category.find({
        name: allCategories,
        createdBy
    })
    console.log({dbAllCategories}, typeof dbAllCategories);
    let transactionsGroupedByCategory = []
    dbAllCategories.forEach(dbCategory => {
        const transactionsWithSameCategory = transactions.filter(transaction => transaction.category === dbCategory.name) 
        let sum = 0
        transactionsWithSameCategory.forEach(transaction => sum += transaction.amount)

        const transaction = {
            category: dbCategory.name,
            icon: dbCategory.icon,
            color: dbCategory.color,
            type: dbCategory.type,
            amount: sum,
            currency: transactionsWithSameCategory[0].currency,
        }
// console.log({ transaction });
        // transactionsGroupedByCategory.push({...transactionsWithSameCategory[0], amount: sum })
        transactionsGroupedByCategory.push(transaction)
    })

    return transactionsGroupedByCategory
}

const getAllTransactions = async (req, res) => {
    const { category, type, grouped } = req.query
console.log(req.query);
    const queryObject = {
        createdBy: req.user.userId
    }
    if (type) queryObject.type = type
    if (category) queryObject.category = category  // FOR FILTER
    
    const transactions = await Transaction.find(queryObject)

    if (grouped === 'true') {  // AS 'false' IS NOT EQUAL TO false
        const transactionsGroupedByCategory = await groupTransactionsByCategory(JSON.parse(JSON.stringify(transactions)), req.user.userId)
        res.status(StatusCodes.OK).json({ 
            transactions: transactionsGroupedByCategory, 
            count: transactionsGroupedByCategory.length 
        })
    } else {
        // console.log(groupTransactionsByCategory(transactions), transactions);
        // groupTransactionsByCategory(JSON.parse(JSON.stringify(transactions)))
        res.status(StatusCodes.OK).json({ transactions, count: transactions.length })
    }
}
const createTransaction = async (req, res) => {
    if (req.body.amount === 0) throw new BadRequestError('Please fill the amount of transaction')
    req.body.createdBy = req.user.userId

    const account = await Account.findOne({ name: req.body.account, createdBy: req.body.createdBy })
    const category = await Category.findOne({ name: req.body.category, createdBy: req.body.createdBy })
    req.body.currency = account.currency
    req.body.color = category.color
    req.body.icon = category.icon

    const transaction = await Transaction.create(req.body)
    res.status(StatusCodes.CREATED).json({ transaction })
}
const getTransaction = async (req, res) => {
    const {
        user: { userId },
        params: { transactionId }
    } = req
    const transaction = await Transaction.findOne({ _id: transactionId, createdBy: userId })

    if (!transaction) throw new NotFoundError(`No transaction with id ${transactionId}`)

    res.status(StatusCodes.OK).json({ transaction })
}
const updateTransaction = async (req, res) => {
    const account = await Account.findOne({ name: req.body.account })
    console.log(account);
    req.body.currency = account.currency

    const {
        user: { userId },
        params: { transactionId },
        body
    } = req
    

    const transaction = await Transaction.findOneAndUpdate({ _id: transactionId, createdBy: userId }, body, {
        new: true,
        runValidators: true
    })

    if (!transaction) throw new NotFoundError(`No transaction with id ${transactionId}`)

    res.status(StatusCodes.OK).json({ transaction })
}
const deleteTransaction = async (req, res) => {
    const {
        user: { userId },
        params: { transactionId }
    } = req
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, createdBy: userId })

    if (!transaction) throw new NotFoundError(`No transaction with id ${transactionId}`)

    res.status(StatusCodes.OK).json({ transaction })
}

module.exports = {
    getAllTransactions,
    createTransaction,
    getTransaction,
    updateTransaction,
    deleteTransaction,
}