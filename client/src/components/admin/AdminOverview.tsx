import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function AdminOverview() {
  const { token } = useAuth()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error('Overview fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading dashboard...</p></div>
  }

  if (!data) {
    return <div className="dashboard-error">Failed to load overview data. Is the server running?</div>
  }

  const statCards = [
    { label: "Today's Reservations", value: data.todayReservations, icon: '📅', color: '#d4a853' },
    { label: 'Pending Reservations', value: data.pendingReservations, icon: '⏳', color: '#f59e0b' },
    { label: 'Active Pre-Orders', value: data.pendingOrders, icon: '🍽️', color: '#8b5cf6' },
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: '💰', color: '#10b981' },
    { label: 'Menu Items', value: data.activeMenuItems, icon: '📋', color: '#3b82f6' },
    { label: 'Unread Messages', value: data.unreadMessages, icon: '📨', color: '#ef4444' },
  ]

  return (
    <div className="admin-overview">
      <div className="overview-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ '--accent': card.color } as any}>
            <div className="stat-card-icon">{card.icon}</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{card.value}</span>
              <span className="stat-card-label">{card.label}</span>
            </div>
            <div className="stat-card-glow" style={{ background: card.color }}></div>
          </div>
        ))}
      </div>

      <div className="overview-charts-row">
        <div className="overview-chart-card">
          <h3>Reservations — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
              <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              <Bar dataKey="count" fill="#d4a853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overview-chart-card">
          <h3>Popular Dishes</h3>
          {data.popularDishes.length > 0 ? (
            <div className="popular-dishes-list">
              {data.popularDishes.map((dish, i) => (
                <div key={i} className="popular-dish-item">
                  <span className="popular-dish-rank">#{i + 1}</span>
                  <span className="popular-dish-name">{dish.name}</span>
                  <span className="popular-dish-count">{dish.count} ordered</span>
                  <div className="popular-dish-bar">
                    <div className="popular-dish-fill" style={{
                      width: `${Math.min(100, (dish.count / (data.popularDishes[0]?.count || 1)) * 100)}%`
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-placeholder">
              <span>📊</span>
              <p>No order data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="overview-recent">
        <h3>Recent Reservations</h3>
        {data.recentReservations.length > 0 ? (
          <div className="recent-table">
            <div className="recent-table-header">
              <span>Customer</span>
              <span>Date & Time</span>
              <span>Guests</span>
              <span>Status</span>
            </div>
            {data.recentReservations.map((r: any) => (
              <div key={r._id} className="recent-table-row">
                <div className="recent-customer">
                  <span className="recent-name">{r.name}</span>
                  <span className="recent-phone">{r.phone}</span>
                </div>
                <span className="recent-datetime">{r.date} at {r.time}</span>
                <span className="recent-guests">👥 {r.guests}</span>
                <span className={`recent-status status-${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data-placeholder">
            <span>📋</span>
            <p>No reservations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
