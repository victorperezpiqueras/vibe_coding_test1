import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import TagSelector from './TagSelector'

describe('TagSelector', () => {
  const mockTags = [
    { id: 1, name: 'Bug', color: '#EF4444' },
    { id: 2, name: 'Feature', color: '#22C55E' },
    { id: 3, name: 'Enhancement', color: '#3B82F6' },
  ]

  const defaultProps = {
    availableTags: mockTags,
    selectedTagIds: [],
    onTagsChange: vi.fn(),
    onCreateTag: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with no tags selected message', () => {
    render(<TagSelector {...defaultProps} />)
    expect(screen.getByText('No tags selected')).toBeInTheDocument()
  })

  it('renders selected tags', () => {
    render(<TagSelector {...defaultProps} selectedTagIds={[1, 2]} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
    expect(screen.queryByText('No tags selected')).not.toBeInTheDocument()
  })

  it('toggles tag selector dropdown', async () => {
    const user = userEvent.setup()
    render(<TagSelector {...defaultProps} />)

    const toggleButton = screen.getByRole('button', { name: /add tags/i })
    expect(screen.queryByText('All tags selected')).not.toBeInTheDocument()

    await user.click(toggleButton)
    expect(screen.getByText(/create new tag/i)).toBeInTheDocument()

    await user.click(toggleButton)
    await waitFor(() => {
      expect(screen.queryByText(/create new tag/i)).not.toBeInTheDocument()
    })
  })

  it('allows selecting an unselected tag', async () => {
    const user = userEvent.setup()
    const onTagsChange = vi.fn()
    render(<TagSelector {...defaultProps} onTagsChange={onTagsChange} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))

    const bugTagButton = screen.getByRole('button', { name: /bug/i })
    await user.click(bugTagButton)

    expect(onTagsChange).toHaveBeenCalledWith([1])
  })

  it('allows removing a selected tag', async () => {
    const user = userEvent.setup()
    const onTagsChange = vi.fn()
    render(<TagSelector {...defaultProps} selectedTagIds={[1]} onTagsChange={onTagsChange} />)

    const removeButton = screen.getByRole('button', { name: /remove bug tag/i })
    await user.click(removeButton)

    expect(onTagsChange).toHaveBeenCalledWith([])
  })

  it('shows "All tags selected" when all tags are selected', async () => {
    const user = userEvent.setup()
    render(<TagSelector {...defaultProps} selectedTagIds={[1, 2, 3]} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    expect(screen.getByText('All tags selected')).toBeInTheDocument()
  })

  it('opens tag creation form', async () => {
    const user = userEvent.setup()
    render(<TagSelector {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    expect(screen.getByPlaceholderText('Tag name')).toBeInTheDocument()
    expect(screen.getByText('Color')).toBeInTheDocument()
  })

  it('creates a new tag', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockResolvedValue()
    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, 'New Tag')

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(onCreateTag).toHaveBeenCalledWith({
        name: 'New Tag',
        color: '#EF4444', // Default color
      })
    })
  })

  it('selects different color when creating tag', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockResolvedValue()
    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, 'Blue Tag')

    // Select blue color (#3B82F6)
    const blueColorButton = screen.getByRole('button', { name: /select #3b82f6/i })
    await user.click(blueColorButton)

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(onCreateTag).toHaveBeenCalledWith({
        name: 'Blue Tag',
        color: '#3B82F6',
      })
    })
  })

  it('cancels tag creation', async () => {
    const user = userEvent.setup()
    render(<TagSelector {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, 'Cancelled Tag')

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(screen.queryByPlaceholderText('Tag name')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create new tag/i })).toBeInTheDocument()
  })

  it('does not create tag with empty name', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockResolvedValue()
    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    expect(onCreateTag).not.toHaveBeenCalled()
  })

  it('handles tag creation error', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockRejectedValue(new Error('Tag already exists'))
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, 'Duplicate Tag')

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to create tag. Tag name might already exist.')
    })

    alertSpy.mockRestore()
  })

  it('trims whitespace from tag name when creating', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockResolvedValue()
    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, '  Trimmed Tag  ')

    const createButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(onCreateTag).toHaveBeenCalledWith({
        name: 'Trimmed Tag',
        color: '#EF4444',
      })
    })
  })

  it('creates tag when Enter key is pressed', async () => {
    const user = userEvent.setup()
    const onCreateTag = vi.fn().mockResolvedValue()
    render(<TagSelector {...defaultProps} onCreateTag={onCreateTag} />)

    await user.click(screen.getByRole('button', { name: /add tags/i }))
    await user.click(screen.getByRole('button', { name: /create new tag/i }))

    const input = screen.getByPlaceholderText('Tag name')
    await user.type(input, 'Enter Tag{Enter}')

    await waitFor(() => {
      expect(onCreateTag).toHaveBeenCalledWith({
        name: 'Enter Tag',
        color: '#EF4444',
      })
    })
  })
})
