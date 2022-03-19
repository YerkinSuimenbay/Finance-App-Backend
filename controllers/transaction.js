const Transaction = require("../models/Transaction")
const Account = require("../models/Account")
const Category = require("../models/Category")
const moment = require('moment')

const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require("../errors")

const groupTransactionsByCategory = async (transactions, createdBy) => {
// console.log({transactions});

    const allCategories = transactions.reduce((acc, curr) => {
      if (!acc.includes(curr.category)) acc.push(curr.category)
      return acc
    }, [])
    const dbAllCategories = await Category.find({
        name: allCategories,
        createdBy
    })
    
    let transactionsGroupedByCategory = []

    const TOTAL = transactions.reduce((acc, curr) => {
        acc += curr.amount
        return acc
    }, 0)
    // console.log({TOTAL});

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
            percentage: Math.floor(sum * 100 / TOTAL),
            currency: transactionsWithSameCategory[0].currency,
        }
// console.log({ transaction });
        // transactionsGroupedByCategory.push({...transactionsWithSameCategory[0], amount: sum })
        transactionsGroupedByCategory.push(transaction)
    })

    return transactionsGroupedByCategory
}

const getAllTransactions = async (req, res) => {
    const { category, type, grouped, period } = req.query

    const queryObject = { createdBy: req.user.userId }
    if (type) queryObject.type = type  // expense OR income
    if (category) queryObject.category = category  // FOR FILTER
    if (period) { 
        if (period === 'day') {
            const milliSeconds = 24 * 60 * 60 * 1000 // MILLI SECONDS
            queryObject.createdAt = {
                "$gte" : new Date(Date.now() - milliSeconds), 
            }
        } else if (period === 'week') {
            const milliSeconds = 7 * 24 * 60 * 60 * 1000 // MILLI SECONDS
            queryObject.createdAt = {
                "$gte" : new Date(Date.now() - milliSeconds), 
            }
        } else if (period === 'mongth') {
            const milliSeconds = 30 * 24 * 60 * 60 * 1000 // MILLI SECONDS
            queryObject.createdAt = {
                "$gte" : new Date(Date.now() - milliSeconds), 
            }
        } else if (period === 'year') {
            const milliSeconds = 365 * 30 * 24 * 60 * 60 * 1000 // MILLI SECONDS
            queryObject.createdAt = {
                "$gte" : new Date(Date.now() - milliSeconds), 
            }
        } else if (period === 'period') {
            const { from, to } = req.query

            if (!from || !to) {
                // throw new BadRequestError('Please, provide both dates')
            } else {
                if (!moment(from).isValid() || !moment(to).isValid()) throw new BadRequestError('Please provide valid dates')
                if (new Date(to) - new Date(from) < 0) throw new BadRequestError('First date cannot be later than second date')
    
                queryObject.createdAt = {
                    "$gte" : new Date(from), 
                    "$lte" : new Date(to), 
                }
            }
            
        }
    } // day, weeek, mongth, year, period

    // console.log(queryObject);
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
    if (+req.body.amount === 0) throw new BadRequestError('Please fill transaction amount')
    
    // const account = await Account.findOne({ name: req.body.account, createdBy: req.user.userId })
    // const category = await Category.findOne({ name: req.body.category, createdBy: req.user.userId })
    // req.body.currency = account.currency
    // req.body.color = category.color
    // req.body.icon = category.icon

    
    const [account, category] = await Promise.all([
        Account.findOne({ name: req.body.account, createdBy: req.user.userId }),
        Category.findOne({ name: req.body.category, createdBy: req.user.userId })
    ])

    if (!account) throw new BadRequestError('Please show account')
    if (!category) throw new BadRequestError('Please show category')
    req.body.currency = account.currency
    req.body.color = category.color
    req.body.icon = category.icon
    
    req.body.createdBy = req.user.userId

    if (req.body.type === 'expense') account.totalCash -= Number(req.body.amount)
    else if (req.body.type === 'income') account.totalCash += Number(req.body.amount)
    // await account.save()
    const [transaction, updatedAccount] = await Promise.all([
        Transaction.create(req.body),
        account.save()
    ])

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
    if (+req.body.amount === 0) throw new BadRequestError('Please fill  transaction amount')

    const {
        user: { userId },
        params: { transactionId },
        body
    } = req

    const account = await Account.findOne({ name: req.body.account, createdBy: req.user.userId })
    if (!account) throw new BadRequestError('Please show account')
    
    const transaction = await Transaction.findOne({ _id: transactionId, createdBy: userId })
    if (!transaction) throw new NotFoundError(`No transaction with id ${transactionId}`)
    
    if (body.type === 'expense') account.totalCash -= Number(body.amount) - transaction.amount 
    else if (body.type === 'income') account.totalCash += Number(body.amount) - transaction.amount
    // await account.save()
    
    transaction.account = body.account
    transaction.amount = body.amount
    transaction.category = body.category
    transaction.comment = body.comment
    transaction.createdAt = body.createdAt
    transaction.createdBy = body.createdBy
    transaction.currency = account.currency
    transaction.type = body.type
    
    // const transaction = await Transaction.findOneAndUpdate(
    //     { _id: transactionId, createdBy: userId }, 
    //     body, 
    //     {
    //         // new: true,
    //         runValidators: true
    //     },
    //     // (err, doc, res) => {
    //     //     console.log({err, doc, res});
    //     // }
    // )

   
    const [updatedTransaction, updatedAccount] = await Promise.all([
        transaction.save(),
        account.save()
    ])

    res.status(StatusCodes.OK).json({ transaction: updatedTransaction })
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