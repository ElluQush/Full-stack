import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

test('<BlogForm /> calls the event handler with right details', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const title = screen.getByPlaceholderText('write title here')
  const author = screen.getByPlaceholderText('write author here')
  const url = screen.getByPlaceholderText('write url here')

  const createButton = screen.getByText('create')

  await user.type(title, 'testing creating a blog...')
  await user.type(author, 'test guy')
  await user.type(url, 'http://testerman.net')
  await user.click(createButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('testing creating a blog...')
  expect(createBlog.mock.calls[0][0].author).toBe('test guy')
  expect(createBlog.mock.calls[0][0].url).toBe('http://testerman.net')
})