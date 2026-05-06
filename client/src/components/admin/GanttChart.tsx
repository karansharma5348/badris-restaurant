import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import ReservationDetails from './ReservationDetails'

interface GanttReservation {
  id: string
  name: string
  phone: string
  email: string
  time: string
  guests: string
  tableNumber: number | null
  status: string
  hasPreOrder: boolean
  message: string
}

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00',
]

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1)

export default function GanttChart() {
  const { token } = useAuth()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reservations, setReservations] = useState<GanttReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRes, setSelectedRes] = useState<GanttReservation | null>(null)
  const [allReservations, setAllReservations] = useState<any[]>([])
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGanttData()
    fetchAllReservations()
  }, [date])

  // Auto-scroll to current time on load
  useEffect(() => {
    if (!loading && chartRef.current) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMin = now.getMinutes()
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin >= 30 ? '30' : '00'}`
      const idx = TIME_SLOTS.findIndex(t => t >= currentTimeStr)
      if (idx > 2) {
        const cellWidth = 100 // approximate cell width
        chartRef.current.scrollLeft = (idx - 2) * cellWidth
      }
    }
  }, [loading])

  const fetchGanttData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/gantt?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setReservations(data.data)
    } catch (err) {
      console.error('Gantt fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllReservations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setAllReservations(data.data)
    } catch (err) {
      console.error('Fetch all failed:', err)
    }
  }

  const getTimeSlotIndex = (time: string) => {
    const idx = TIME_SLOTS.findIndex(t => t === time)
    return idx >= 0 ? idx : 0
  }

  const getReservationForSlot = (table: number, slotIdx: number) => {
    return reservations.find(r => {
      if (r.tableNumber !== table) return false
      const rIdx = getTimeSlotIndex(r.time)
      // Each reservation occupies ~2 hours (4 slots of 30min)
      return slotIdx >= rIdx && slotIdx < rIdx + 4
    })
  }

  const isSlotStart = (table: number, slotIdx: number) => {
    return reservations.some(r => r.tableNumber === table && getTimeSlotIndex(r.time) === slotIdx)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      fetchGanttData()
      fetchAllReservations()
      setSelectedRes(null)
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  const assignTable = async (id: string, tableNumber: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/${id}/table`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tableNumber }),
      })
      fetchGanttData()
      fetchAllReservations()
    } catch (err) {
      console.error('Table assign failed:', err)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return '#10b981'
      case 'pending': return '#d4a853'
      case 'cancelled': return '#ef4444'
      case 'completed': return '#6366f1'
      default: return '#666'
    }
  }

  // Current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const totalMinutes = hours * 60 + minutes
    const startMinutes = 11 * 60 // 11:00
    const endMinutes = 23 * 60   // 23:00
    if (totalMinutes < startMinutes || totalMinutes > endMinutes) return null
    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
  }

  const currentTimePos = getCurrentTimePosition()
  const unassigned = allReservations.filter(r => !r.tableNumber && r.status !== 'cancelled')

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="gantt-wrapper">
      {/* Date Navigation */}
      <div className="gantt-controls">
        <div className="gantt-controls-left">
          <button className="gantt-nav-btn" onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() - 1)
            setDate(d.toISOString().split('T')[0])
          }}>‹ Prev</button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="gantt-date-input" />
          <button className="gantt-nav-btn" onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() + 1)
            setDate(d.toISOString().split('T')[0])
          }}>Next ›</button>
          <button className="gantt-nav-btn today" onClick={() => setDate(new Date().toISOString().split('T')[0])}>Today</button>
        </div>
        <div className="gantt-controls-right">
          <span className="gantt-date-label">{formatDateLabel(date)}</span>
          <span className="gantt-count">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading"><div className="loading-spinner"></div></div>
      ) : (
        <>
          {/* Gantt Chart */}
          <div className="gantt-chart-container" ref={chartRef}>
            <div className="gantt-chart" style={{ position: 'relative' }}>
              {/* Current time indicator */}
              {currentTimePos !== null && (
                <div className="gantt-now-line" style={{ left: `calc(80px + ${currentTimePos}% * (100% - 80px) / 100)` }}>
                  <div className="gantt-now-dot"></div>
                </div>
              )}

              {/* Header row - X Axis (Time) */}
              <div className="gantt-row gantt-header-row">
                <div className="gantt-y-label gantt-corner-cell">
                  <span className="gantt-axis-label">Table ↓ / Time →</span>
                </div>
                {TIME_SLOTS.map((slot, i) => (
                  <div key={i} className={`gantt-time-slot-header ${i % 2 === 0 ? 'hour-mark' : ''}`}>
                    {slot}
                  </div>
                ))}
              </div>

              {/* Table rows - Y Axis (Table Number) */}
              {TABLES.map(table => {
                const tableReservations = reservations.filter(r => r.tableNumber === table)
                return (
                  <div key={table} className={`gantt-row ${tableReservations.length > 0 ? 'has-reservations' : ''}`}>
                    <div className="gantt-y-label">
                      <span className="gantt-table-icon">🪑</span>
                      <span className="gantt-table-num">T{table}</span>
                      {tableReservations.length > 0 && (
                        <span className="gantt-table-count">{tableReservations.length}</span>
                      )}
                    </div>
                    {TIME_SLOTS.map((_, slotIdx) => {
                      const res = getReservationForSlot(table, slotIdx)
                      const isStart = isSlotStart(table, slotIdx)

                      if (res && isStart) {
                        return (
                          <div
                            key={slotIdx}
                            className={`gantt-block gantt-block-${res.status}`}
                            style={{
                              gridColumn: `span 4`,
                              background: `linear-gradient(135deg, ${statusColor(res.status)}33, ${statusColor(res.status)}11)`,
                              borderLeft: `3px solid ${statusColor(res.status)}`,
                              borderTop: `1px solid ${statusColor(res.status)}44`,
                              borderBottom: `1px solid ${statusColor(res.status)}44`,
                              borderRight: `1px solid ${statusColor(res.status)}22`,
                            }}
                            onClick={() => setSelectedRes(res)}
                            title={`${res.name} | ${res.time} | ${res.guests} guests | ${res.status}`}
                          >
                            <span className="gantt-block-name">{res.name}</span>
                            <span className="gantt-block-info">👥{res.guests} • {res.time}</span>
                            {res.hasPreOrder && <span className="gantt-block-badge" title="Has Pre-Order">🍽️</span>}
                          </div>
                        )
                      }

                      if (res && !isStart) return null

                      return <div key={slotIdx} className={`gantt-cell ${slotIdx % 2 === 0 ? 'hour-mark' : ''}`}></div>
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Unassigned Reservations */}
          {unassigned.length > 0 && (
            <div className="gantt-unassigned">
              <h3>⚠️ Unassigned Reservations ({unassigned.length})</h3>
              <div className="unassigned-list">
                {unassigned.map((r: any) => (
                  <div key={r._id} className="unassigned-card">
                    <div className="unassigned-info">
                      <strong>{r.name}</strong>
                      <span>{r.time} • 👥 {r.guests} guests</span>
                      <span className="unassigned-phone">{r.phone}</span>
                    </div>
                    <div className="unassigned-actions">
                      <select
                        defaultValue=""
                        onChange={e => assignTable(r._id, parseInt(e.target.value))}
                        className="unassigned-select"
                      >
                        <option value="" disabled>Assign Table</option>
                        {TABLES.map(t => (
                          <option key={t} value={t}>Table {t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="gantt-legend">
            <span><span className="legend-dot" style={{ background: '#d4a853' }}></span> Pending</span>
            <span><span className="legend-dot" style={{ background: '#10b981' }}></span> Confirmed</span>
            <span><span className="legend-dot" style={{ background: '#ef4444' }}></span> Cancelled</span>
            <span><span className="legend-dot" style={{ background: '#6366f1' }}></span> Completed</span>
            <span>🍽️ = Has Pre-Order</span>
          </div>
        </>
      )}

      {selectedRes && (
        <ReservationDetails
          reservation={selectedRes}
          onClose={() => setSelectedRes(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}
