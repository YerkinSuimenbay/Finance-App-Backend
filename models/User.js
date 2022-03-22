require('dotenv').config()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minLength: 3,
        maxLength: 20,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email'
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: 5,
    },
    settings: {
        app_language: {
            type: String,
            // enum: {
            //     values: ['kz', 'ru', 'en'],
            //     message: '{VALUE} is not supported'
            // },
            // default: 'en'
            required: [true, 'Please provide app language'],

        },
        default_account: {
            type: String,
            required: [true, 'Please provide default account'],
        },
        default_period: {
            type: String,
            required: [true, 'Please provide default period'],
            // enum: {
            //     values: ['Day', 'Week', 'Month', 'Year'],
            //     message: '{VALUE} is not supported'
            // },
            // default: 'Day'
        },
    }
})

UserSchema.pre('save', async function(next) {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt) // hashedPassword
    next()
})

UserSchema.methods.generateToken = function() {
    const payload = {
        userId: this._id,
        name: this.name
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
    return token
}

UserSchema.methods.checkPassword = async function(candidatePassword) {
    const isMatch = await bcryptjs.compare(candidatePassword, this.password)
    console.log({isMatch});
    return isMatch
}

module.exports = model('User', UserSchema)