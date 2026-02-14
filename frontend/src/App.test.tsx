import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from './App'
import { createMockFetch, setupMockFetch } from './test/test-utils'
import { mockItems, mockTags } from './test/mock-data'

// Mock fetch globally
const mockFetch = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).fetch = mockFetch

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).localStorage = localStorageMock

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    setupMockFetch(mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the main layout components', () => {
      render(<App />)
      expect(screen.getByText('Task Board')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('displays API status as healthy', async () => {
      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('healthy')).toBeInTheDocument()
      })
    })

    it('displays API status as disconnected when health check fails', async () => {
      setupMockFetch(mockFetch, (url) => {
        if (url.includes('/health')) {
          return Promise.reject(new Error('Network error'))
        }
      })

      render(<App />)
      await waitFor(() => {
        expect(screen.getByText('disconnected')).toBeInTheDocument()
      })
    })

    it('fetches items and tags on mount', async () => {
      render(<App />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/health')
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/items/')
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/tags/')
      })
    })
  })

  describe('Sync Functionality', () => {
    it('syncs data when Sync button is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      vi.clearAllMocks()

      const syncButton = screen.getByRole('button', { name: /sync/i })
      await user.click(syncButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/items/')
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/tags/')
      })
    })
  })

  describe('Task Creation', () => {
    it('opens create dialog when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addButton = screen.getByRole('button', { name: /add new task/i })
      await user.click(addButton)

      expect(screen.getByPlaceholderText('Enter task name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
    })

    it('closes dialog when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getByRole('button', { name: /add new task/i }))
      expect(screen.getByPlaceholderText('Enter task name')).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter task name')).not.toBeInTheDocument()
      })
    })

    it('creates a new task successfully', async () => {
      const user = userEvent.setup()
      const newItem = mockItems.simple

      setupMockFetch(mockFetch, (url, options) => {
        if (url.includes('/items/') && options?.method === 'POST') {
          return Promise.resolve(createMockFetch().post(newItem))
        }
        if (url.includes('/items/')) {
          return Promise.resolve(createMockFetch().items([newItem]))
        }
      })

      render(<App />)

      await user.click(screen.getByRole('button', { name: /add new task/i }))

      const nameInput = screen.getByPlaceholderText('Enter task name')
      await user.type(nameInput, 'Test Task')

      const descInput = screen.getByPlaceholderText(/description/i)
      await user.type(descInput, 'Test Description')

      const createButton = screen.getByRole('button', { name: /create task/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/items/',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      })
    })

    it('does not create task with empty name', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getByRole('button', { name: /add new task/i }))

      const createButton = screen.getByRole('button', { name: /create task/i })
      await user.click(createButton)

      const postCalls = mockFetch.mock.calls.filter((call) => call[1]?.method === 'POST')
      expect(postCalls.length).toBe(0)
    })
  })

  describe('Task Display', () => {
    it('renders items in To Do column by default', async () => {
      setupMockFetch(mockFetch, (url) => {
        if (url.includes('/items/')) {
          return Promise.resolve(
            createMockFetch().items([mockItems.simple, mockItems.withDescription]),
          )
        }
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(mockItems.simple.name)).toBeInTheDocument()
        expect(screen.getByText(mockItems.withDescription.name)).toBeInTheDocument()
      })
    })

    it('renders tasks with tags', async () => {
      setupMockFetch(mockFetch, (url) => {
        if (url.includes('/items/')) {
          return Promise.resolve(createMockFetch().items([mockItems.withTags]))
        }
        if (url.includes('/tags/')) {
          return Promise.resolve(createMockFetch().tags([mockTags.bug, mockTags.feature]))
        }
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(mockItems.withTags.name)).toBeInTheDocument()
        expect(screen.getByText(mockTags.bug.name)).toBeInTheDocument()
        expect(screen.getByText(mockTags.feature.name)).toBeInTheDocument()
      })
    })
  })

  describe('Task Deletion', () => {
    it('deletes a task when delete button is clicked', async () => {
      const user = userEvent.setup()
      const itemToDelete = mockItems.simple

      let itemsData = [itemToDelete]

      setupMockFetch(mockFetch, (url, options) => {
        if (url.includes('/items/1') && options?.method === 'DELETE') {
          itemsData = []
          return Promise.resolve(createMockFetch().delete())
        }
        if (url.includes('/items/')) {
          return Promise.resolve(createMockFetch().items(itemsData))
        }
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(itemToDelete.name)).toBeInTheDocument()
      })

      const taskCard = screen.getByText(itemToDelete.name).closest('article')
      const deleteButton = taskCard?.querySelector('button')
      if (!deleteButton) throw new Error('Delete button not found')

      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/items/1', {
          method: 'DELETE',
        })
      })
    })
  })

  describe('LocalStorage Persistence', () => {
    it('persists task status to localStorage', async () => {
      const user = userEvent.setup()

      setupMockFetch(mockFetch, (url, options) => {
        if (url.includes('/items/1') && options?.method === 'DELETE') {
          return Promise.resolve(createMockFetch().delete())
        }
        if (url.includes('/items/')) {
          return Promise.resolve(createMockFetch().items([mockItems.simple]))
        }
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(mockItems.simple.name)).toBeInTheDocument()
      })

      const taskCard = screen.getByText(mockItems.simple.name).closest('article')
      const deleteButton = taskCard?.querySelector('button')
      if (!deleteButton) throw new Error('Delete button not found')

      await user.click(deleteButton)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('taskStatusMap', expect.any(String))
      })
    })

    it('loads task status from localStorage on mount', () => {
      const savedStatus = { '1': 'done', '2': 'inprogress' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedStatus))

      setupMockFetch(mockFetch, (url) => {
        if (url.includes('/items/')) {
          return Promise.resolve(
            createMockFetch().items([
              { ...mockItems.simple, id: 1 },
              { ...mockItems.withDescription, id: 2 },
            ]),
          )
        }
      })

      render(<App />)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('taskStatusMap')
    })

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('LocalStorage error')
      })

      expect(() => render(<App />)).not.toThrow()
    })
  })

  describe('Footer', () => {
    it('renders footer with backend API link', () => {
      render(<App />)
      const link = screen.getByRole('link', { name: /localhost:8000\/docs/i })
      expect(link).toHaveAttribute('href', 'http://localhost:8000/docs')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
})
