const { Schema, model, Types } = require('mongoose')
const ENUM = require('../utils/enums')

const TransactionSchema = new Schema({
    type: {
        type: String,
        required: [true, 'Please provide transaction type'],
        enum: {
            values: ['income', 'expense'],
            message: '{VALUE} is not supported'
        },
        // default: 'expense',
    },
    amount: {
        type: Number,
        required: [true, 'Please provide amount of transaction'],
    },
    currency: {
        type: String,
        required: [true, 'Please provide transaction currency'],
        enum: {
            values: ['KZT', 'RUB', 'USD'],
            message: '{VALUE} is not supported'
        },
    },
    account: {
        // type: Types.ObjectId,
        // ref: 'Account',
        type: String,
        required: [true, 'Please provide account name']
    },
    // color: {
    //     type: String,
    //     required: [true, 'Please provide color'],
    //     // enum: {
    //     //     values: ENUM.color,
    //     //     message: '{VALUE} is not supported'
    //     // },
    // },
    comment: {
        type: String,
        default: '',
    },
    category: {
        // type: Types.ObjectId,
        // ref: 'Category',
        type: String,
        required: [true, 'Please provide category name'],
        // IS ENUM NEEDED?
    },
    // icon: {
    //     type: String,
    // },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    },
    createdAt: {
        type: Date, 
        default: Date.now,
        required: [true, 'Please provide created date']
    }
}, 
// { timestamps: true }
)

module.exports = model('Transaction', TransactionSchema)