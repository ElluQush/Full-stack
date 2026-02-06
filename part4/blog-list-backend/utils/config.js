require('dotenv').config()

const PORT = process.env.PORT

const url = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  url,
  PORT
}