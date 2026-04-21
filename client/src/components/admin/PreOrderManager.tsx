import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  reservation: {
    _id: string
    name: string
    phone: string
    email: string
    date: string
    time: string
    guests: string
    tableNumber: number | null
  }
  items: OrderItem[]
  totalAmount: number
  status: string
  specialInstructions: string
  createdAt: string
}

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'served']

export default function PreOrderManager() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setOrders(data.data)
    } catch (err) {
      console.error('Orders fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      fetchOrders()
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current)
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'pending': return '⏳'
      case 'confirmed': return '✅'
      case 'preparing': return '🔥'
      case 'ready': return '🔔'
      case 'served': return '✔️'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading pre-orders...</p></div>
  }

  return (
    <div className="preorder-manager">
      <div className="preorder-filters">
        {['all', ...STATUS_FLOW, 'cancelled'].map(s => (
          <button
            key={s}
            className={`preorder-filter-btn ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? '📋 All' : `${statusIcon(s)} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            <span className="filter-count">
              {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="no-data-placeholder">
          <span>🍽️</span>
          <p>No pre-orders {filterStatus !== 'all' ? `with status "${filterStatus}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="preorder-grid">
          {filtered.map(order => {
            const next = getNextStatus(order.status)
            return (
              <div key={order._id} className={`preorder-card status-border-${order.status}`}>
                <div className="preorder-card-header">
                  <div className="preorder-customer">
                    <h4>{order.reservation?.name || 'Unknown'}</h4>
                    <span className="preorder-meta">
                      {order.reservation?.date} • {order.reservation?.time} • 👥 {order.reservation?.guests}
                    </span>
                    {order.reservation?.tableNumber && (
                      <span className="preorder-table">🪑 Table {order.reservation.tableNumber}</span>
                    )}
                  </div>
                  <div className={`preorder-status status-${order.status}`}>
                    {statusIcon(order.status)} {order.status}
                  </div>
                </div>

                <div className="preorder-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="preorder-item">
                      <span className="preorder-item-name">{item.name}</span>
                      <span className="preorder-item-qty">×{item.quantity}</span>
                      <span className="preorder-item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="preorder-total">
                  <span>Total</span>
                  <span className="preorder-total-amount">₹{order.totalAmount}</span>
                </div>

                {order.specialInstructions && (
                  <div className="preorder-instructions">
                    <span>📝</span> {order.specialInstructions}
                  </div>
                )}

                <div className="preorder-actions">
                  {next && (
                    <button
                      className="preorder-next-btn"
                      onClick={() => updateStatus(order._id, next)}
                    >
                      {statusIcon(next)} Move to {next.charAt(0).toUpperCase() + next.slice(1)}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'served' && (
                    <button
                      className="preorder-cancel-btn"
                      onClick={() => updateStatus(order._id, 'cancelled')}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
