const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogRouter = require('./controllers/blogs')

const app = express()

mongoose
    .connect(config.url, { family: 4 })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.use(express.json())

app.use('/api/blogs', blogRouter)

module.exports = app