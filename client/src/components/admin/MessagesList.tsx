import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ContactMessage {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function MessagesList() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setMessages(data.data)
    } catch (err) {
      console.error('Messages fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchMessages()
    } catch (err) {
      console.error('Mark read failed:', err)
    }
  }

  const createTicket = async (msg: ContactMessage) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/from-contact/${msg._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: 'medium' }),
      })
      fetchMessages()
      alert('Ticket created from this message!')
    } catch (err) {
      console.error('Create ticket failed:', err)
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading messages...</p></div>
  }

  return (
    <div className="messages-list">
      <div className="messages-summary">
        <span className="msg-count-total">📨 {messages.length} total</span>
        <span className="msg-count-unread">🔴 {messages.filter(m => !m.isRead).length} unread</span>
      </div>

      {messages.length === 0 ? (
        <div className="no-data-placeholder">
          <span>📨</span>
          <p>No contact messages yet</p>
        </div>
      ) : (
        <div className="messages-grid">
          {messages.map(msg => (
            <div key={msg._id} className={`message-card ${!msg.isRead ? 'unread' : ''}`}>
              <div className="message-header">
                <div className="message-sender">
                  <h4>{msg.name}</h4>
                  <span>{msg.email}</span>
                </div>
                <div className="message-meta">
                  <span className="message-date">
                    {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {!msg.isRead && <span className="unread-badge">NEW</span>}
                </div>
              </div>
              <div className="message-subject">{msg.subject}</div>
              <p className="message-body">{msg.message}</p>
              <div className="message-actions">
                {!msg.isRead && (
                  <button className="msg-btn-read" onClick={() => markAsRead(msg._id)}>
                    ✅ Mark as Read
                  </button>
                )}
                <button className="msg-btn-ticket" onClick={() => createTicket(msg)}>
                  🎫 Create Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
