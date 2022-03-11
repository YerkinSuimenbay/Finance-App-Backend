const { Schema, model, Types } = require('mongoose')
const ENUM = require('../utils/enums')

const CategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide category name'],
    },
    type: {
        type: String,
        enum: {
            values: ['income', 'expense'],
            message: '{VALUE} is not supported'
        },
        default: 'expense',
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
        required: [true, 'Please provide category color'],
        // enum: {
        //     values: ENUM.color,
        //     message: '{VALUE} is not supported'
        // },
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    }
})

module.exports = model('Category', CategorySchema)