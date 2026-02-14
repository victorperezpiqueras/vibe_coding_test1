import { useEffect, useMemo, useState } from 'react'
import Dialog from './components/Dialog'
import Tag from './components/Tag'
import TagSelector from './components/TagSelector'
import type { Column, ColumnKey, Item, StatusMap, Tag as TagType, TagCreateData } from './types'

const API_URL = 'http://localhost:8000'
const STORAGE_KEY = 'taskStatusMap'
const COLUMNS: Column[] = [
  { key: 'todo', title: 'To Do' },
  { key: 'inprogress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [statusMap, setStatusMap] = useState<StatusMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Check API health on mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then((data: { status: string }) => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items/`)
      const data: Item[] = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/tags/`)
      const data: TagType[] = await response.json()
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  // Load items and tags on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchItems()
      await fetchTags()
    }
    loadData()
  }, [])

  // Create a new item
  const createItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    try {
      const response = await fetch(`${API_URL}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDescription || 'Created from React frontend',
          tag_ids: selectedTagIds,
        })
      })

      if (response.ok) {
        setNewItemName('')
        setNewItemDescription('')
        setSelectedTagIds([])
        setIsCreateDialogOpen(false)
        fetchItems()
      }
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  // Create a new tag
  const createTag = async (tagData: TagCreateData): Promise<TagType> => {
    const response = await fetch(`${API_URL}/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagData)
    })

    if (!response.ok) {
      throw new Error('Failed to create tag')
    }

    const newTag: TagType = await response.json()
    await fetchTags()
    return newTag
  }

  // Delete an item
  const deleteItem = async (itemId: number) => {
    try {
      await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE'
      })
      setStatusMap(prev => {
        const next = { ...prev }
        delete next[itemId]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Persist status map
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap))
    } catch (e) {
      // ignore persistence errors in localStorage
      // ensure block is non-empty to satisfy linting
      void e
    }
  }, [statusMap])

  // Derived columns
  const columnsData = useMemo(() => {
    const byCol: Record<ColumnKey, Item[]> = {
      todo: [],
      inprogress: [],
      done: [],
    }
    for (const item of items) {
      const status = statusMap[item.id] || 'todo'
      byCol[status]?.push(item)
    }
    return byCol
  }, [items, statusMap])

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent<HTMLElement>, item: Item) => {
    e.dataTransfer.setData('text/plain', String(item.id))
  }

  const onDrop = (e: React.DragEvent<HTMLElement>, columnKey: ColumnKey) => {
    const idStr = e.dataTransfer.getData('text/plain')
    if (!idStr) return
    const id = Number(idStr)
    setStatusMap(prev => ({ ...prev, [id]: columnKey }))
  }

  const allowDrop = (e: React.DragEvent<HTMLElement>) => e.preventDefault()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Task Board</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">API: <span data-testid="api-status" className={apiStatus === 'healthy' ? 'text-emerald-600' : 'text-rose-600'}>{apiStatus}</span></span>
            <button data-testid="sync-button" onClick={() => { fetchItems(); fetchTags(); }} className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-700">Sync</button>
          </div>
        </div>
      </header>

      {/* Compose */}
      <section className="mx-auto max-w-7xl w-full px-6 py-6">
        <button
          data-testid="add-task-button"
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-slate-400 hover:bg-slate-100"
        >
          + Add new task
        </button>
      </section>

      {/* Create Item Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setNewItemName('')
          setNewItemDescription('')
          setSelectedTagIds([])
        }}
        title="Create New Task"
      >
        <form onSubmit={createItem} className="space-y-4">
          <div>
            <label htmlFor="task-name" className="block text-sm font-medium text-slate-700 mb-1">
              Task name
            </label>
            <input
              id="task-name"
              data-testid="task-name-input"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter task name"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="task-description"
              data-testid="task-description-input"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <TagSelector
              availableTags={tags}
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
              onCreateTag={createTag}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              data-testid="cancel-task-button"
              type="button"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setNewItemName('')
                setNewItemDescription('')
                setSelectedTagIds([])
              }}
              className="rounded-md bg-slate-200 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              data-testid="create-task-button"
              type="submit"
              className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-500"
            >
              Create Task
            </button>
          </div>
        </form>
      </Dialog>

      {/* Board */}
      <main className="mx-auto max-w-7xl w-full px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(col => {
            const columnKey = col.key as ColumnKey
            return (
            <div key={col.key} data-testid={`column-${col.key}`} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700">{col.title}</h2>
                <span className="text-xs text-slate-500">{columnsData[columnKey].length}</span>
              </div>
              <div
                className="p-3 space-y-3 min-h-40 max-h-[60vh] overflow-y-auto scrollbar-thin"
                onDragOver={allowDrop}
                onDrop={(e) => onDrop(e, columnKey)}
              >
                {columnsData[columnKey].length === 0 ? (
                  <div className="text-xs text-slate-400 py-6 text-center">Drag tasks here</div>
                ) : (
                  columnsData[columnKey].map(item => (
                    <article
                      key={item.id}
                      data-testid={`task-${item.id}`}
                      className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md cursor-grab"
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-slate-800">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.tags.map(tag => (
                                <Tag key={tag.id} name={tag.name} color={tag.color} />
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          data-testid={`delete-task-${item.id}`}
                          onClick={() => deleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )})}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-slate-500">
          Backend: <a className="underline hover:text-slate-700" href="http://localhost:8000/docs" target="_blank">localhost:8000/docs</a>
        </div>
      </footer>
    </div>
  )
}

export default App
