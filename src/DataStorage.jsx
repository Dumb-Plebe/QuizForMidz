import { useState } from 'react'
import { API_BASE_URL } from './config.js'

export default function DataStorage() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')

  const saveData = async () => {
    try {
      setStatus('Saving...')
      const response = await fetch(`${API_BASE_URL}/store.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: text })
      })

      const result = await response.json()

      if (result.success) {
        setStatus('Saved successfully!')
      } else {
        setStatus('Error: ' + result.error)
      }
    } catch (error) {
      setStatus('Error: ' + error.message)
    }
  }

  const loadData = async () => {
    try {
      setStatus('Loading...')
      const response = await fetch(`${API_BASE_URL}/read.php`)
      const result = await response.json()

      if (result.success) {
        setText(result.data)
        setStatus('Loaded successfully!')
      } else {
        setStatus('Error: ' + result.error)
      }
    } catch (error) {
      setStatus('Error: ' + error.message)
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to save..."
        rows={4}
        cols={50}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <button onClick={saveData} style={{ marginRight: '10px' }}>
        Save
      </button>
      <button onClick={loadData}>
        Load
      </button>
      {status && <p style={{ marginTop: '10px', fontStyle: 'italic' }}>{status}</p>}
    </div>
  )
}