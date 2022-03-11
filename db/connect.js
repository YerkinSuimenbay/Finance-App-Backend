const mongoose = require('mongoose')

const connectDB = url => mongoose.connect(url, console.log('Connecting to DB...'))
  
module.exports = connectDB