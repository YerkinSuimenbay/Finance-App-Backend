require('dotenv').config()
require('express-async-errors')

const cors = require('cors')

const express = require('express')
// DB
const connectDB = require('./db/connect')

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authenticateUser = require('./middleware/authentication')

// ROUTES
const authRouter = require('./routes/auth')
const transactionRouter = require('./routes/transaction')
const accountRouter = require('./routes/account')
const categoryRouter = require('./routes/category')
const userRouter = require('./routes/user')

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())

app.get('/', (req, res) => {
    res.send('Finance Home route')
})
// MIDDLEWARE
app.use(express.json())


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', authenticateUser, userRouter)
app.use('/api/v1/transactions', authenticateUser, transactionRouter)
app.use('/api/v1/accounts', authenticateUser, accountRouter)
app.use('/api/v1/categories', authenticateUser, categoryRouter)
// app.use('/api/v1/settings', authenticateUser, settingsRouter)


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, console.log(`Server is listening on port ${PORT}...`))
    } catch (error) {
        console.log(error);
    }
}

start()