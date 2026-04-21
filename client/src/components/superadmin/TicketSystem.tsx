import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface Ticket {
  _id: string
  subject: string
  description: string
  customerName: string
  customerEmail: string
  priority: string
  status: string
  assignedTo?: { username: string; fullName: string }
  resolution: string
  resolvedAt: string
  source: string
  createdAt: string
}

const STATUSES = ['open', 'in-progress', 'resolved', 'closed']

export default function TicketSystem() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [resolution, setResolution] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    subject: '', description: '', customerName: '', customerEmail: '', priority: 'medium',
  })

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setTickets(data.data)
    } catch (err) {
      console.error('Tickets fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateTicket = async (id: string, updates: any) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
      fetchTickets()
      setSelectedTicket(null)
      setResolution('')
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      })
      setShowCreate(false)
      setCreateForm({ subject: '', description: '', customerName: '', customerEmail: '', priority: 'medium' })
      fetchTickets()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#666'
    }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'open': return '🔴'
      case 'in-progress': return '🟡'
      case 'resolved': return '🟢'
      case 'closed': return '⚫'
      default: return '⚪'
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading tickets...</p></div>
  }

  return (
    <div className="ticket-system">
      <div className="ticket-toolbar">
        <button className="ticket-create-btn" onClick={() => setShowCreate(true)}>
          ➕ Create Ticket
        </button>
        <button className="ticket-refresh-btn" onClick={fetchTickets}>🔄 Refresh</button>
      </div>

      {/* Kanban Board */}
      <div className="ticket-kanban">
        {STATUSES.map(status => {
          const col = tickets.filter(t => t.status === status)
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-header">
                <span>{statusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</span>
                <span className="kanban-count">{col.length}</span>
              </div>
              <div className="kanban-cards">
                {col.map(ticket => (
                  <div
                    key={ticket._id}
                    className="kanban-card"
                    onClick={() => { setSelectedTicket(ticket); setResolution(ticket.resolution || '') }}
                  >
                    <div className="kanban-card-priority" style={{ background: priorityColor(ticket.priority) }}>
                      {ticket.priority.toUpperCase()}
                    </div>
                    <h4 className="kanban-card-title">{ticket.subject}</h4>
                    <p className="kanban-card-desc">{ticket.description.slice(0, 80)}...</p>
                    <div className="kanban-card-footer">
                      <span className="kanban-card-customer">👤 {ticket.customerName}</span>
                      <span className="kanban-card-date">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {ticket.source !== 'manual' && (
                      <span className="kanban-card-source">from {ticket.source}</span>
                    )}
                  </div>
                ))}
                {col.length === 0 && (
                  <div className="kanban-empty">No tickets</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎫 Ticket Details</h3>
              <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="ticket-detail-grid">
                <div className="ticket-detail-item">
                  <label>Subject</label>
                  <span>{selectedTicket.subject}</span>
                </div>
                <div className="ticket-detail-item">
                  <label>Customer</label>
                  <span>{selectedTicket.customerName}</span>
                </div>
                <div className="ticket-detail-item">
                  <label>Email</label>
                  <span>{selectedTicket.customerEmail || 'N/A'}</span>
                </div>
                <div className="ticket-detail-item">
                  <label>Priority</label>
                  <span className="priority-badge" style={{ color: priorityColor(selectedTicket.priority) }}>
                    {selectedTicket.priority.toUpperCase()}
                  </span>
                </div>
                <div className="ticket-detail-item">
                  <label>Status</label>
                  <span>{statusIcon(selectedTicket.status)} {selectedTicket.status}</span>
                </div>
                <div className="ticket-detail-item">
                  <label>Source</label>
                  <span>{selectedTicket.source}</span>
                </div>
                <div className="ticket-detail-item full-width">
                  <label>Description</label>
                  <p>{selectedTicket.description}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="ticket-status-actions">
                <label>Change Status:</label>
                <div className="ticket-status-btns">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`ticket-status-btn ${selectedTicket.status === s ? 'active' : ''}`}
                      onClick={() => updateTicket(selectedTicket._id, { status: s })}
                      disabled={selectedTicket.status === s}
                    >
                      {statusIcon(s)} {s.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Change */}
              <div className="ticket-priority-actions">
                <label>Change Priority:</label>
                <div className="ticket-priority-btns">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button
                      key={p}
                      className={`ticket-priority-btn ${selectedTicket.priority === p ? 'active' : ''}`}
                      style={{ '--pcolor': priorityColor(p) } as any}
                      onClick={() => updateTicket(selectedTicket._id, { priority: p })}
                      disabled={selectedTicket.priority === p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="ticket-resolution">
                <label>Resolution Notes:</label>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  placeholder="Add resolution notes..."
                  rows={3}
                />
                <button
                  className="ticket-resolve-btn"
                  onClick={() => updateTicket(selectedTicket._id, { resolution, status: 'resolved' })}
                >
                  ✅ Resolve with Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create Ticket</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={createTicket} className="ticket-create-form">
              <div className="md-form-field">
                <label>Subject *</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={e => setCreateForm({ ...createForm, subject: e.target.value })}
                  required
                  placeholder="Ticket subject"
                />
              </div>
              <div className="md-form-field">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={createForm.customerName}
                  onChange={e => setCreateForm({ ...createForm, customerName: e.target.value })}
                  required
                  placeholder="Customer name"
                />
              </div>
              <div className="md-form-field">
                <label>Customer Email</label>
                <input
                  type="email"
                  value={createForm.customerEmail}
                  onChange={e => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="md-form-field">
                <label>Priority</label>
                <select
                  value={createForm.priority}
                  onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="md-form-field full-width">
                <label>Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="md-form-actions">
                <button type="button" className="md-form-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="md-form-submit">🎫 Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
