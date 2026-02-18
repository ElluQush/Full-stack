const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')

    const user1 = {
      name: 'tester',
      username: 'testerman',
      password: 'secret'
    }

    const user2 = {
      name: 'second user',
      username: 'second',
      password: 'secret'
    }

    await request.post('/api/users', {
      data: user1
    })

    await request.post('/api/users', {
      data: user2
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel('username').fill('testerman')
      await page.getByLabel('password').fill('secret')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('tester logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.goto('/')

      await page.getByLabel('username').fill('wrong')
      await page.getByLabel('password').fill('password')
      await page.getByRole('button', { name: 'login' }).click()

      const errorNotification = page.locator('.notification.error')

      await expect(errorNotification).toBeVisible()
      await expect(errorNotification).toContainText('wrong username or password')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('testerman')
      await page.getByLabel('password').fill('secret')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('tester logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('testing new blog')
      await page.getByLabel('author').fill('the tester')
      await page.getByLabel('url').fill('http://testerman.to')

      await page.getByRole('button', { name: 'create' }).click()

      const blog = page.locator('.blog', { hasText: 'testing new blog the tester' })

      const successNotification = page.locator('.notification.success')
      await expect(successNotification).toBeVisible()
      await expect(successNotification).toContainText('testing new blog')

      await expect(blog).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('testing new blog')
      await page.getByLabel('author').fill('the tester')
      await page.getByLabel('url').fill('http://testerman.to')

      await page.getByRole('button', { name: 'create' }).click()

      const blog = page.locator('.blog', { hasText: 'testing new blog the tester' })

      await blog.getByRole('button', { name: 'view' }).click()

      const likeButton = blog.locator('button', { hasText: 'like' })
      await expect(likeButton).toBeVisible()
      const likesCounter = blog.locator('.blog-likes')
      await likeButton.click()
      await expect(likesCounter).toContainText('likes 1', { timeout: 5000 })
    })

    describe('deletion of blogs', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()

        await page.getByLabel('title').fill('testing new blog')
        await page.getByLabel('author').fill('the tester')
        await page.getByLabel('url').fill('http://testerman.to')

        await page.getByRole('button', { name: 'create' }).click()
      })

      test('a blog can be deleted by same user', async ({ page }) => {
        const blog = page.locator('.blog', { hasText: 'testing new blog the tester' })
        await blog.getByRole('button', { name: 'view' }).click()

        const removeButton = blog.getByRole('button', { name: 'remove' })
        await expect(removeButton).toBeVisible()

        page.on('dialog', dialog => dialog.accept())
        await removeButton.click()

        await expect(blog).toHaveCount(0, { timeout: 5000 })
      })

      test('blog delete button not shown to user who did not create blog', async ({ page, request }) => {
        const blog = page.locator('.blog', { hasText: 'testing new blog the tester' })

        await page.getByRole('button', { name: 'logout' }).click()

        await page.getByLabel('username').fill('second')
        await page.getByLabel('password').fill('secret')
        await page.getByRole('button', { name: 'login' }).click()

        await expect(page.getByText('second user logged in')).toBeVisible()

        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })
    })
  })
})