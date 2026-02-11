const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

test('all blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 14)
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

describe('deletion of a blog', () => {
  test('succeed with status code 204 if id is valid', async () => {
    const firstResponse = await api.get('/api/blogs')
    const blogToDelete = firstResponse.body[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const secondResponse = await api.get('/api/blogs')

    const ids = secondResponse.body.map(b => b.id)

    assert(!ids.includes(blogToDelete.id))
  })
})

describe('updating a blog', () => {
  test('succeeds with code 200 if succesful addition to likes', async () => {
    const firstResponse = await api.get('/api/blogs')
    const blogToUpdate = firstResponse.body[0]

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const secondResponse = await api.get('/api/blogs')
    const updated = secondResponse.body.find(b => b.id === blogToUpdate.id)

    assert.strictEqual(updated.likes, blogToUpdate.likes + 1)
  })

  test('succeed with code 200 if succesful update of title', async () => {
    const firstResponse = await api.get('/api/blogs')
    const blogToUpdate = firstResponse.body[0]

    const updatedBlog = {
      ...blogToUpdate,
      title: "tsiiga på denhä"
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const secondResponse = await api.get('/api/blogs')
    const updated = secondResponse.body.find(b => b.id === blogToUpdate.id)

    assert.strictEqual(updated.title, "tsiiga på denhä")
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'majaeli',
      name: 'Elias Majander',
      password: 'mhmmmm'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const username = usersAtEnd.map(u => u.username)
    assert(username.includes(newUser.username))
  })

  test('response with status 400 if username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ma',
      name: 'short',
      password: 'valid'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(result.body.error.includes('username must be at least 3 characters long'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('response with status 400 if password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'valid',
      name: 'short pass',
      password: 'no'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(result.body.error.includes('password must be at least 3 characters long'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})