require('dotenv').config({ path: '/config.env' })

const mongoose = require('mongoose')
const MONGO_URI = process.env.MONGO_URI

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('connection to Mongo database succesful')
  } catch (err) {
    const error = new Error('Could not connect to database')
    error.statusCode = 500
    process.exit(1)
    return next(error)
  }
}
module.exports = connectDb
