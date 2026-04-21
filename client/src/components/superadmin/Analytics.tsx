import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Analytics() {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [ticketStats, setTicketStats] = useState<any>(null)
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
      console.error(err)
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
      console.error(err)
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading analytics...</p></div>
  }

  if (!data) {
    return <div className="dashboard-error">Failed to load analytics data.</div>
  }

  const ticketPieData = ticketStats ? [
    { name: 'Open', value: ticketStats.open, color: '#ef4444' },
    { name: 'In Progress', value: ticketStats.inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: ticketStats.resolved, color: '#10b981' },
    { name: 'Closed', value: ticketStats.closed, color: '#6b7280' },
  ].filter(d => d.value > 0) : []

  const reservationStatusData = [
    { name: 'Pending', value: data.pendingReservations, color: '#d4a853' },
    { name: 'Confirmed', value: data.confirmedReservations, color: '#10b981' },
  ]

  return (
    <div className="analytics-page">
      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span className="am-value">₹{data.totalRevenue.toLocaleString()}</span>
          <span className="am-label">Total Revenue</span>
        </div>
        <div className="analytics-metric">
          <span className="am-value">{data.totalReservations}</span>
          <span className="am-label">Total Reservations</span>
        </div>
        <div className="analytics-metric">
          <span className="am-value">{data.totalOrders}</span>
          <span className="am-label">Total Pre-Orders</span>
        </div>
        <div className="analytics-metric">
          <span className="am-value">{ticketStats?.avgResolutionHours || 0}h</span>
          <span className="am-label">Avg Ticket Resolution</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        <div className="analytics-chart-card">
          <h3>📅 Reservations Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis
                dataKey="date"
                stroke="#666"
                fontSize={11}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              />
              <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-chart-card">
          <h3>🎫 Ticket Distribution</h3>
          {ticketPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={ticketPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ticketPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-placeholder"><span>🎫</span><p>No tickets yet</p></div>
          )}
          <div className="pie-legend">
            {ticketPieData.map((d, i) => (
              <span key={i} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: d.color }}></span>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Dishes Chart */}
      <div className="analytics-chart-card full-width">
        <h3>🍽️ Most Popular Dishes</h3>
        {data.popularDishes.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.popularDishes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#666" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} width={150} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#d4a853" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-placeholder"><span>📊</span><p>No order data yet to show popular dishes</p></div>
        )}
      </div>
    </div>
  )
}
