import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

global.localStorage = localStorageMock

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    
    // Default mock responses
    mockFetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the Task Board header', () => {
    render(<App />)
    expect(screen.getByText('Task Board')).toBeInTheDocument()
  })

  it('displays API status as healthy', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('healthy')).toBeInTheDocument()
    })
  })

  it('displays API status as disconnected when health check fails', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.reject(new Error('Network error'))
      }
      if (url.includes('/items/') || url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
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

  it('shows "Add new task" button initially', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
  })

  it('opens task form when "Add new task" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const addButton = screen.getByRole('button', { name: /add new task/i })
    await user.click(addButton)
    
    expect(screen.getByPlaceholderText('Task name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
  })

  it('closes task form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    expect(screen.getByPlaceholderText('Task name')).toBeInTheDocument()
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Task name')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
    })
  })

  it('creates a new task', async () => {
    const user = userEvent.setup()
    const mockItems = [
      { id: 1, name: 'Test Task', description: 'Test Description', tags: [] },
    ]

    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems[0]),
        })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)
    
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    const nameInput = screen.getByPlaceholderText('Task name')
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
          body: JSON.stringify({
            name: 'Test Task',
            description: 'Test Description',
            tag_ids: [],
          }),
        })
      )
    })
  })

  it('does not create task with empty name', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    const createButton = screen.getByRole('button', { name: /create task/i })
    await user.click(createButton)
    
    // Should not make POST request
    const postCalls = mockFetch.mock.calls.filter(
      call => call[1]?.method === 'POST'
    )
    expect(postCalls.length).toBe(0)
  })

  it('displays the three columns: To Do, In Progress, Done', () => {
    render(<App />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders items in To Do column by default', async () => {
    const mockItems = [
      { id: 1, name: 'Task 1', description: 'Desc 1', tags: [] },
      { id: 2, name: 'Task 2', description: 'Desc 2', tags: [] },
    ]

    mockFetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })

  it('deletes a task when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockItems = [
      { id: 1, name: 'Task to Delete', description: 'Will be deleted', tags: [] },
    ]

    let itemsData = [...mockItems]

    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/1') && options?.method === 'DELETE') {
        itemsData = []
        return Promise.resolve({ ok: true })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(itemsData),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument()
    })

    // Hover to reveal delete button
    const taskCard = screen.getByText('Task to Delete').closest('article')
    const deleteButton = taskCard.querySelector('button')
    
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/items/1',
        { method: 'DELETE' }
      )
    })
  })

  it('syncs data when Sync button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Wait for initial fetches
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

  it('renders tasks with tags', async () => {
    const mockTags = [
      { id: 1, name: 'Bug', color: '#EF4444' },
      { id: 2, name: 'Feature', color: '#22C55E' },
    ]

    const mockItems = [
      {
        id: 1,
        name: 'Task with tags',
        description: 'Has multiple tags',
        tags: mockTags,
      },
    ]

    mockFetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTags),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Task with tags')).toBeInTheDocument()
      expect(screen.getByText('Bug')).toBeInTheDocument()
      expect(screen.getByText('Feature')).toBeInTheDocument()
    })
  })

  it('persists task status to localStorage', async () => {
    const mockItems = [
      { id: 1, name: 'Task 1', description: 'Desc', tags: [] },
    ]

    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/1') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })

    // Delete the task which triggers localStorage update (removes from statusMap)
    const taskCard = screen.getByText('Task 1').closest('article')
    const deleteButton = taskCard.querySelector('button')
    const user = userEvent.setup()
    await user.click(deleteButton)

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'taskStatusMap',
        expect.any(String)
      )
    })
  })

  it('loads task status from localStorage on mount', () => {
    const savedStatus = { '1': 'done', '2': 'inprogress' }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedStatus))

    const mockItems = [
      { id: 1, name: 'Done Task', description: 'Should be in done', tags: [] },
      { id: 2, name: 'InProgress Task', description: 'Should be in progress', tags: [] },
    ]

    mockFetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      }
      if (url.includes('/items/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    render(<App />)

    expect(localStorageMock.getItem).toHaveBeenCalledWith('taskStatusMap')
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('LocalStorage error')
    })

    // Should not throw
    expect(() => render(<App />)).not.toThrow()
  })

  it('renders footer with backend API link', () => {
    render(<App />)
    const link = screen.getByRole('link', { name: /localhost:8000\/docs/i })
    expect(link).toHaveAttribute('href', 'http://localhost:8000/docs')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
