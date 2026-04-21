import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface OverviewData {
  totalReservations: number
  todayReservations: number
  pendingReservations: number
  confirmedReservations: number
  totalOrders: number
  pendingOrders: number
  totalMenuItems: number
  activeMenuItems: number
  totalTickets: number
  openTickets: number
  unreadMessages: number
  totalContacts: number
  totalRevenue: number
  recentReservations: any[]
  popularDishes: { name: string; count: number }[]
  last7Days: { date: string; count: number }[]
}

interface TicketStats {
  open: number
  inProgress: number
  resolved: number
  closed: number
  total: number
  avgResolutionHours: number
}

export default function SystemOverview() {
  const { token } = useAuth()
  const [data, setData] = useState<OverviewData | null>(null)
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchOverview(), fetchTicketStats()]).finally(() => setLoading(false))
  }, [])

  const fetchOverview = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error('Overview fetch failed:', err)
    }
  }

  const fetchTicketStats = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) setTicketStats(json.data)
    } catch (err) {
      console.error('Ticket stats fetch failed:', err)
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading system overview...</p></div>
  }

  if (!data) {
    return <div className="dashboard-error">Failed to load system data. Is the server running?</div>
  }

  return (
    <div className="sa-overview">
      {/* Top Stats Row */}
      <div className="sa-stats-mega">
        <div className="sa-mega-card revenue">
          <div className="sa-mega-icon">💰</div>
          <div className="sa-mega-info">
            <span className="sa-mega-value">₹{data.totalRevenue.toLocaleString()}</span>
            <span className="sa-mega-label">Total Revenue</span>
          </div>
        </div>
        <div className="sa-mega-card reservations">
          <div className="sa-mega-icon">📅</div>
          <div className="sa-mega-info">
            <span className="sa-mega-value">{data.totalReservations}</span>
            <span className="sa-mega-label">Total Reservations</span>
          </div>
        </div>
        <div className="sa-mega-card orders">
          <div className="sa-mega-icon">🍽️</div>
          <div className="sa-mega-info">
            <span className="sa-mega-value">{data.totalOrders}</span>
            <span className="sa-mega-label">Total Pre-Orders</span>
          </div>
        </div>
        <div className="sa-mega-card tickets">
          <div className="sa-mega-icon">🎫</div>
          <div className="sa-mega-info">
            <span className="sa-mega-value">{ticketStats?.total || 0}</span>
            <span className="sa-mega-label">Total Tickets</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <span className="sa-stat-icon">📅</span>
          <span className="sa-stat-value">{data.todayReservations}</span>
          <span className="sa-stat-label">Today's Reservations</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">⏳</span>
          <span className="sa-stat-value">{data.pendingReservations}</span>
          <span className="sa-stat-label">Pending</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">🔴</span>
          <span className="sa-stat-value">{ticketStats?.open || 0}</span>
          <span className="sa-stat-label">Open Tickets</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">🔧</span>
          <span className="sa-stat-value">{ticketStats?.inProgress || 0}</span>
          <span className="sa-stat-label">In Progress</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">✅</span>
          <span className="sa-stat-value">{ticketStats?.resolved || 0}</span>
          <span className="sa-stat-label">Resolved</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">⏱️</span>
          <span className="sa-stat-value">{ticketStats?.avgResolutionHours || 0}h</span>
          <span className="sa-stat-label">Avg Resolution</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">📋</span>
          <span className="sa-stat-value">{data.activeMenuItems}</span>
          <span className="sa-stat-label">Active Menu Items</span>
        </div>
        <div className="sa-stat-card">
          <span className="sa-stat-icon">📨</span>
          <span className="sa-stat-value">{data.unreadMessages}</span>
          <span className="sa-stat-label">Unread Messages</span>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="sa-activity-row">
        <div className="sa-activity-card">
          <h3>🍽️ Popular Dishes</h3>
          {data.popularDishes.length > 0 ? (
            <div className="sa-popular-list">
              {data.popularDishes.map((dish, i) => (
                <div key={i} className="sa-popular-item">
                  <span className="sa-popular-rank">#{i + 1}</span>
                  <span className="sa-popular-name">{dish.name}</span>
                  <span className="sa-popular-count">{dish.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="sa-no-data">No order data yet</p>
          )}
        </div>

        <div className="sa-activity-card">
          <h3>📋 Recent Reservations</h3>
          {data.recentReservations.length > 0 ? (
            <div className="sa-recent-list">
              {data.recentReservations.slice(0, 5).map((r: any) => (
                <div key={r._id} className="sa-recent-item">
                  <div className="sa-recent-info">
                    <strong>{r.name}</strong>
                    <span>{r.date} • {r.time}</span>
                  </div>
                  <span className={`sa-recent-status status-${r.status}`}>{r.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="sa-no-data">No reservations yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
