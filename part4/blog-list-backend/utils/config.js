require('dotenv').config()

const PORT = process.env.PORT
const url = process.env.MONGODB_URI

module.exports = { url, PORT }