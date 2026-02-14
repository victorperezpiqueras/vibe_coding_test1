import { useEffect, useMemo, useState } from 'react'
import Dialog from './components/Dialog'
import Header from './components/Header'
import Board from './components/Board'
import TaskForm from './components/TaskForm'
import Footer from './components/Footer'
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
  const createItem = async (data: { name: string; description: string; tag_ids: number[] }) => {
    try {
      const response = await fetch(`${API_URL}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || 'Created from React frontend',
          tag_ids: data.tag_ids,
        })
      })

      if (response.ok) {
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

  const handleSync = () => {
    fetchItems()
    fetchTags()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header apiStatus={apiStatus} onSync={handleSync} />

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
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          availableTags={tags}
          onSubmit={createItem}
          onCancel={() => setIsCreateDialogOpen(false)}
          onCreateTag={createTag}
        />
      </Dialog>

      <Board
        columns={COLUMNS}
        columnsData={columnsData}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onDelete={deleteItem}
      />

      <Footer />
    </div>
  )
}

export default App
