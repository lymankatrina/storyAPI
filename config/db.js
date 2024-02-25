const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const mongoose = require('mongoose')

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {})
    console.log(`MongoDb Connected: ${conn.connection}`)
  } catch (err) {
    console.error('Failed to connect to MongoDb:', err)
    process.exit(1)
  }
}

module.exports = {
  connectDb
}
