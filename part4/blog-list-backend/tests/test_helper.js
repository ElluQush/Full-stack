const Blog = require('../models/blog')
const User = require('../models/user')

const getAuthToken = async (api) => {
  const login = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  return login.body.token
}

const nonExistingId = async () => {
  const blog = new Blog({ title: "removesoon", author: "nobody", url: "nah.com" })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  nonExistingId,
  blogsInDb,
  usersInDb,
  getAuthToken
}