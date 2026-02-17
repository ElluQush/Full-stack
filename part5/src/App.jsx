import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import loginService from './services/login'
import blogService from './services/blogs'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notification, setNotification] = useState(null)
  const [user, setUser] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setNotification({ message: 'Login successful', type: 'success' })
      setTimeout(() => setNotification(null), 3000)
    } catch {
      setNotification({ message: 'wrong username or password', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()

    window.localStorage.removeItem('loggedBlogAppUser')
    blogService.setToken(null)
    setUser(null)

    setNotification({
      message: 'Logged out',
      type: 'success'
    })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const addBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()

    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      setNotification({
        message: `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
    } catch {
      setNotification({
        message: 'Error creating a blog',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleLike = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1
    }

    const returnedBlog = await blogService.update(updatedBlog, blog.id)
    setBlogs(blogs.map(b =>
      b.id === returnedBlog.id ? returnedBlog : b
    ))
  }

  const handleRemove = async (blog) => {
    const confirm = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)

    if (!confirm) return

    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      setNotification({ message: `Removed ${blog.title}`, type: 'success' })
      setTimeout(() => setNotification(null), 3000)
    } catch {
      setNotification({ message: 'Error removing blog', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  return (
    <div>
      <h1>blogs</h1>
      {notification && <Notification notification={notification} />}

      {!user && (
        <LoginForm handleLogin={handleLogin} />
      )}

      {user && (
        <div>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>

          {blogs
            .sort((a, b) => b.likes - a.likes)
            .map(blog =>
              <Blog key={blog.id} blog={blog} handleLike={handleLike} user={user} handleRemove={handleRemove} />
            )}
        </div>
      )}
    </div>
  )
}


export default App