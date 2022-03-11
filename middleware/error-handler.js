const { StatusCodes } = require('http-status-codes')

const errorHandler = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something broke!'
    }
console.log(err);
    if (err.name === 'ValidationError') {
        customError.message = Object.values(err.errors).map(singleError => singleError.message).join('. ')
        customError.statusCode = 400
    } else if (err.name === 'CastError' && Object.keys(err.reason).length) {
        customError.message = `Invalid type for ${err.path} was provided. Expected '${(err.kind).toLowerCase()}', but got ${err.valueType}`
        customError.statusCode = 404
    } else if (err.name === 'CastError') {
        customError.message = `No item with id ${err.value}`
        customError.statusCode = 404
    }


    // return res.status(customError.statusCode).json({ err })
    res.status(customError.statusCode).json({ msg: customError.message, err })
}

module.exports = errorHandler