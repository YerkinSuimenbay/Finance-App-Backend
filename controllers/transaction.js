const Transaction = require("../models/Transaction")
const Account = require("../models/Account")

const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const groupTransactionsByCategory = (transactions) => {
    const allCategories = transactions.reduce((acc, curr) => {
      if (!acc.includes(curr.category)) acc.push(curr.category)
      return acc
    }, [])
    
    let transactionsGroupedByCategory = []
    allCategories.map(category => {
        const transactionsWithSameCategory = transactions.filter(transaction => transaction.category === category) 
        let sum = 0
        transactionsWithSameCategory.forEach(transaction => sum += transaction.amount)
        transactionsGroupedByCategory.push({ ...transactionsWithSameCategory[0], amount: sum })
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
        const transactionsGroupedByCategory = groupTransactionsByCategory(JSON.parse(JSON.stringify(transactions)))
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

    const account = await Account.findOne({ name: req.body.account })
    req.body.currency = account.currency

    req.body.createdBy = req.user.userId
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