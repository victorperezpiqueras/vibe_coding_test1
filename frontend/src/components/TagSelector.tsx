import { useState } from 'react'
import Tag from './Tag'
import type { Tag as TagType, TagCreateData } from '../types'

const DEFAULT_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#A855F7', // purple
  '#EC4899', // pink
  '#6B7280', // gray
]

interface TagSelectorProps {
  availableTags: TagType[]
  selectedTagIds: number[]
  onTagsChange: (tagIds: number[]) => void
  onCreateTag: (tagData: TagCreateData) => Promise<TagType>
}

/**
 * TagSelector component for selecting and creating tags
 */
function TagSelector({ availableTags, selectedTagIds, onTagsChange, onCreateTag }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0]!)

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id))
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id))

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      const newTag = await onCreateTag({ name: newTagName.trim(), color: newTagColor })
      // Automatically select the newly created tag
      if (newTag && newTag.id) {
        onTagsChange([...selectedTagIds, newTag.id])
      }
      setNewTagName('')
      setNewTagColor(DEFAULT_COLORS[0]!)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Failed to create tag. Tag name might already exist.')
    }
  }

  return (
    <div className="relative">
      <div className="mb-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
          {selectedTags.length === 0 ? (
            <span className="text-sm text-slate-400">No tags selected</span>
          ) : (
            selectedTags.map(tag => (
              <Tag
                key={tag.id}
                name={tag.name}
                color={tag.color}
                onRemove={() => handleToggleTag(tag.id)}
              />
            ))
          )}
        </div>
      </div>

      <button
        data-testid="toggle-tags-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        {isOpen ? '− Hide tags' : '+ Add tags'}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
          {!isCreating ? (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {unselectedTags.length === 0 ? (
                  <span className="text-sm text-slate-500">All tags selected</span>
                ) : (
                  unselectedTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium opacity-60 hover:opacity-100"
                      style={{ backgroundColor: tag.color, color: '#fff' }}
                    >
                      {tag.name}
                      <span className="text-xs">+</span>
                    </button>
                  ))
                )}
              </div>
              <button
                data-testid="create-new-tag-button"
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                + Create new tag
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div>
                <input
                  data-testid="new-tag-name-input"
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateTag(e)
                    }
                  }}
                  placeholder="Tag name"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Color</label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newTagColor === color ? 'border-slate-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="create-tag-submit-button"
                  type="button"
                  onClick={handleCreateTag}
                  className="rounded-md bg-indigo-600 text-white px-3 py-1 text-xs hover:bg-indigo-500"
                >
                  Create
                </button>
                <button
                  data-testid="cancel-create-tag-button"
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setNewTagName('')
                    setNewTagColor(DEFAULT_COLORS[0]!)
                  }}
                  className="rounded-md bg-slate-200 text-slate-700 px-3 py-1 text-xs hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TagSelector
