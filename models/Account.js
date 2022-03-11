const { Schema, model, Types } = require('mongoose')
const ENUM = require('../utils/enums')

const AccountSchema = new Schema({
    totalCash: {
        type: Number,
        required: [true, "Please provide account's total cash"],
        default: 0,
    },
    name: {
        type: String,
        required: [true, 'Please provide account name'],
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
        required: [true, 'Please provide color'],
        // enum: {
        //     values: ENUM.color,
        //     message: '{VALUE} is not supported'
        // },
    },
    currency: {
        type: String,
        enum: {
            values: ['KZT', 'RUB', 'USD'],
            message: '{VALUE} is not supported'
        },
        default: 'KZT'
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    }
})

module.exports = model('Account', AccountSchema)