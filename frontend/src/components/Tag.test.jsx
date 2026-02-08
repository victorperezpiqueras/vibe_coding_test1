import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import Tag from './Tag'

describe('Tag', () => {
  it('renders tag with name and color', () => {
    render(<Tag name="Important" color="#FF0000" />)
    const tag = screen.getByText('Important')
    expect(tag).toBeInTheDocument()
    expect(tag).toHaveStyle({ backgroundColor: '#FF0000', color: '#fff' })
  })

  it('renders tag without remove button by default', () => {
    render(<Tag name="Bug" color="#EF4444" />)
    const removeButton = screen.queryByRole('button')
    expect(removeButton).not.toBeInTheDocument()
  })

  it('renders tag with remove button when onRemove is provided', () => {
    const handleRemove = vi.fn()
    render(<Tag name="Feature" color="#22C55E" onRemove={handleRemove} />)
    const removeButton = screen.getByRole('button', { name: /remove feature tag/i })
    expect(removeButton).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<Tag name="Test" color="#3B82F6" onRemove={handleRemove} />)

    const removeButton = screen.getByRole('button', { name: /remove test tag/i })
    await user.click(removeButton)

    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Tag name="Custom" color="#A855F7" className="custom-class" />)
    const tag = screen.getByText('Custom')
    expect(tag).toHaveClass('custom-class')
  })

  it('renders with different colors correctly', () => {
    const { rerender } = render(<Tag name="Tag1" color="#EF4444" />)
    expect(screen.getByText('Tag1')).toHaveStyle({ backgroundColor: '#EF4444' })

    rerender(<Tag name="Tag2" color="#22C55E" />)
    expect(screen.getByText('Tag2')).toHaveStyle({ backgroundColor: '#22C55E' })
  })

  it('has accessible aria-label on remove button', () => {
    const handleRemove = vi.fn()
    render(<Tag name="Accessible" color="#6B7280" onRemove={handleRemove} />)
    const removeButton = screen.getByRole('button', { name: 'Remove Accessible tag' })
    expect(removeButton).toHaveAttribute('aria-label', 'Remove Accessible tag')
  })
})
