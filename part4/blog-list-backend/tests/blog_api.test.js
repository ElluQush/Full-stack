const { test, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('all blogs are returned as json', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, 3)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    const blog = response.body[0]

    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
})

test('valid blog can be added', async () => {
    const newBlog = {
        title: 'new blog can be added!',
        author: 'me, myself and I',
        url: 'yeaboi.com',
        likes: 69,
    }

    const beforePost = await api.get('/api/blogs')
    const blogsBefore = beforePost.body.length

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const afterPost = await api.get('/api/blogs')
    const blogsAfter = afterPost.body.length

    assert.strictEqual(blogsAfter, blogsBefore + 1)

    const authors = afterPost.body.map(r => r.author)

    assert(authors.includes('me, myself and I'))
})

test('missing likes defaults to 0', async () => {
    const newBlog = {
        title: 'missing likes',
        author: 'meitsi',
        url: 'ja-ne.nippon'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const latestBlog = response.body[response.body.length - 1]

    assert.strictEqual(latestBlog.likes, 0)
})

test('missing title responds with 400', async () => {
    const newBlog = {
        author: 'no title man',
        url: 'notitleman.com',
        likes: 2
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})

test('missing url responds with 400', async () => {
    const newBlog = {
        title: 'no url here',
        author: 'no url lady',
        likes: 2
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})

after(async () => {
    await mongoose.connection.close()
})