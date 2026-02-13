import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import ItemDetailDialog from './ItemDetailDialog'

describe('ItemDetailDialog', () => {
  const mockItem = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    tags: [
      { id: 1, name: 'Bug', color: '#EF4444' },
      { id: 2, name: 'Feature', color: '#22C55E' },
    ],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:45:00Z',
  }

  const mockTags = [
    { id: 1, name: 'Bug', color: '#EF4444' },
    { id: 2, name: 'Feature', color: '#22C55E' },
    { id: 3, name: 'Enhancement', color: '#3B82F6' },
  ]

  const defaultProps = {
    item: mockItem,
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    availableTags: mockTags,
    onCreateTag: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<ItemDetailDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Task Details')).not.toBeInTheDocument()
  })

  it('does not render when item is null', () => {
    render(<ItemDetailDialog {...defaultProps} item={null} />)
    expect(screen.queryByText('Task Details')).not.toBeInTheDocument()
  })

  it('renders dialog with item details', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    expect(screen.getByText('Task Details')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('displays item name in editable field', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    const nameInput = screen.getByTestId('item-detail-name')
    expect(nameInput).toHaveValue('Test Task')
  })

  it('displays item description in editable field', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    const descriptionInput = screen.getByTestId('item-detail-description')
    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('displays formatted created timestamp', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    const createdAt = screen.getByTestId('item-detail-created')
    expect(createdAt).toBeInTheDocument()
    expect(createdAt.textContent).not.toBe('N/A')
  })

  it('displays formatted updated timestamp', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    const updatedAt = screen.getByTestId('item-detail-updated')
    expect(updatedAt).toBeInTheDocument()
    expect(updatedAt.textContent).not.toBe('N/A')
  })

  it('handles missing timestamps gracefully', () => {
    const itemWithoutTimestamps = { ...mockItem, created_at: null, updated_at: null }
    render(<ItemDetailDialog {...defaultProps} item={itemWithoutTimestamps} />)

    const createdAt = screen.getByTestId('item-detail-created')
    const updatedAt = screen.getByTestId('item-detail-updated')

    expect(createdAt).toHaveTextContent('N/A')
    expect(updatedAt).toHaveTextContent('N/A')
  })

  it('allows editing item name', async () => {
    const user = userEvent.setup()
    render(<ItemDetailDialog {...defaultProps} />)

    const nameInput = screen.getByTestId('item-detail-name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Task')

    expect(nameInput).toHaveValue('Updated Task')
  })

  it('allows editing item description', async () => {
    const user = userEvent.setup()
    render(<ItemDetailDialog {...defaultProps} />)

    const descriptionInput = screen.getByTestId('item-detail-description')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated Description')

    expect(descriptionInput).toHaveValue('Updated Description')
  })

  it('calls onSave with updated data when save button is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue()
    render(<ItemDetailDialog {...defaultProps} onSave={onSave} />)

    const nameInput = screen.getByTestId('item-detail-name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Task')

    const saveButton = screen.getByTestId('item-detail-save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated Task',
        description: 'Test Description',
        tag_ids: [1, 2],
      })
    })
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ItemDetailDialog {...defaultProps} onClose={onClose} />)

    const cancelButton = screen.getByTestId('item-detail-cancel')
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows error when trying to save with empty name', async () => {
    const user = userEvent.setup()
    render(<ItemDetailDialog {...defaultProps} />)

    const nameInput = screen.getByTestId('item-detail-name')
    await user.clear(nameInput)

    const saveButton = screen.getByTestId('item-detail-save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows error when save fails', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))
    render(<ItemDetailDialog {...defaultProps} onSave={onSave} />)

    const saveButton = screen.getByTestId('item-detail-save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })

  it('disables buttons while saving', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<ItemDetailDialog {...defaultProps} onSave={onSave} />)

    const saveButton = screen.getByTestId('item-detail-save')
    const cancelButton = screen.getByTestId('item-detail-cancel')

    await user.click(saveButton)

    expect(saveButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
    expect(saveButton).toHaveTextContent('Saving...')
  })

  it('closes dialog after successful save', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue()
    const onClose = vi.fn()
    render(<ItemDetailDialog {...defaultProps} onSave={onSave} onClose={onClose} />)

    const saveButton = screen.getByTestId('item-detail-save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('trims whitespace from name and description before saving', async () => {
    const user = userEvent.setup({ delay: null })
    const onSave = vi.fn().mockResolvedValue()
    render(<ItemDetailDialog {...defaultProps} onSave={onSave} />)

    const nameInput = screen.getByTestId('item-detail-name')
    const descriptionInput = screen.getByTestId('item-detail-description')

    await user.clear(nameInput)
    await user.type(nameInput, '  Trimmed Name  ')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, '  Trimmed Description  ')

    const saveButton = screen.getByTestId('item-detail-save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        id: 1,
        name: 'Trimmed Name',
        description: 'Trimmed Description',
        tag_ids: [1, 2],
      })
    })
  })

  it('resets form when dialog is reopened', async () => {
    const { rerender } = render(<ItemDetailDialog {...defaultProps} />)

    // Close the dialog
    rerender(<ItemDetailDialog {...defaultProps} isOpen={false} />)

    // Reopen with the same item
    rerender(<ItemDetailDialog {...defaultProps} isOpen={true} />)

    const nameInput = screen.getByTestId('item-detail-name')
    expect(nameInput).toHaveValue('Test Task')
  })

  it('renders TagSelector component', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    expect(screen.getByText('Tags')).toBeInTheDocument()
  })

  it('initializes with item tags', () => {
    render(<ItemDetailDialog {...defaultProps} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
  })

  it('handles items without tags', () => {
    const itemWithoutTags = { ...mockItem, tags: [] }
    render(<ItemDetailDialog {...defaultProps} item={itemWithoutTags} />)
    expect(screen.getByText('No tags selected')).toBeInTheDocument()
  })

  it('handles items with undefined tags', () => {
    const itemWithUndefinedTags = { ...mockItem, tags: undefined }
    render(<ItemDetailDialog {...defaultProps} item={itemWithUndefinedTags} />)
    expect(screen.getByText('No tags selected')).toBeInTheDocument()
  })
})
