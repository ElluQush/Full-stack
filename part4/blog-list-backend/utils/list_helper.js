const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return 0

    const max = blogs.reduce((prev, current) => {
        return (prev && prev.likes > current.likes) ? prev : current
    })

    return max
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return 0

    const grouped = _.groupBy(blogs, 'author')

    const max = _.maxBy(Object.keys(grouped), author => grouped[author].length)

    return { author: max, blogs: grouped[max].length }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return 0

    const grouped = _.groupBy(blogs, 'author')

    const max = _.maxBy(Object.keys(grouped), author =>
        grouped[author].reduce((sum, blog) => sum + blog.likes, 0)
    )

    return { author: max, likes: grouped[max].reduce((sum, blog) => sum + blog.likes, 0) }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}