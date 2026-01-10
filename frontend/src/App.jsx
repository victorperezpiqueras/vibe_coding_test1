import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const [newItemName, setNewItemName] = useState('')
  const [apiStatus, setApiStatus] = useState('checking...')

  // Check API health on mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items/`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  // Create a new item
  const createItem = async (e) => {
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
          description: 'Created from React frontend'
        })
      })
      
      if (response.ok) {
        setNewItemName('')
        fetchItems()
      }
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  // Delete an item
  const deleteItem = async (itemId) => {
    try {
      await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE'
      })
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + FastAPI</h1>
      
      <div className="card">
        <p>API Status: <strong>{apiStatus}</strong></p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      <div className="card">
        <h2>Items Management</h2>
        <button onClick={fetchItems} style={{ marginBottom: '1rem' }}>
          Fetch Items from API
        </button>

        <form onSubmit={createItem} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            style={{ marginRight: '0.5rem', padding: '0.5rem' }}
          />
          <button type="submit">Create Item</button>
        </form>

        <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          {items.length === 0 ? (
            <p>No items yet. Click "Fetch Items" or create one!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {items.map(item => (
                <li key={item.id} style={{ 
                  border: '1px solid #646cff', 
                  padding: '0.5rem', 
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>{item.description}</p>}
                  </div>
                  <button onClick={() => deleteItem(item.id)} style={{ padding: '0.25rem 0.5rem' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="read-the-docs">
        Backend API running at <a href="http://localhost:8000/docs" target="_blank">localhost:8000/docs</a>
      </p>
    </>
  )
}

export default App
