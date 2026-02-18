import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { expect, test, vi } from 'vitest'

test('render title and author, but not url or likes', () => {
  const blog = {
    title: 'Testing blog',
    author: 'elias',
    url: 'http://testaaja.com',
    likes: 1337
  }

  render(<Blog blog={blog} />)

  screen.getByText('Testing blog elias')

  const url = screen.queryByText('http://testaaja.com')
  expect(url).toBeNull()

  const likes = screen.queryByText('1337')
  expect(likes).toBeNull()
})

test('show url and likes when button is clicked', async () => {
  const blog = {
    title: 'Testing blog',
    author: 'elias',
    url: 'http://testaaja.com',
    likes: 1337
  }

  render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  screen.getByText('http://testaaja.com')
  screen.getByText('likes 1337')
})

test('clicking like twice calls event handler twice', async () => {
  const blog = {
    title: 'Testing blog',
    author: 'elias',
    url: 'http://testaaja.com',
    likes: 1337
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} handleLike={mockHandler} />)

  const user = userEvent.setup()
  const viewButton = screen.getByText('view')
  await user.click(viewButton)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})