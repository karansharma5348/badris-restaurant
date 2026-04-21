import { useState, useEffect } from 'react'

interface Reservation {
  _id: string
  name: string
  phone: string
  email: string
  date: string
  time: string
  guests: string
  message: string
  status: string
  createdAt: string
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations')
      const data = await res.json()
      if (data.success) {
        setReservations(data.data)
      }
    } catch {
      setError('Could not connect to server. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ts
    }
  }

  return (
    <section className="reservations-page" id="reservations-list" style={{
      padding: '120px 24px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="section-subtitle">Admin Dashboard</span>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
            All Reservations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} received
          </p>
        </div>
        <button onClick={fetchReservations} style={{
          background: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))',
          color: 'var(--bg-dark)',
          padding: '12px 28px',
          borderRadius: '50px',
          fontWeight: '600',
          fontSize: '0.9rem',
          letterSpacing: '0.5px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(212, 168, 83, 0.3)',
        }}>
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <p>Loading reservations...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(200, 16, 46, 0.1)',
          border: '1px solid rgba(200, 16, 46, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#ff6b6b',
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>⚠️ {error}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>node server.js</code> in the server directory
          </p>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-white)', marginBottom: '8px' }}>
            No Reservations Yet
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Reservations will appear here when customers book a table.
          </p>
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {reservations.map((r) => (
            <div key={r._id} style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '28px 32px',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.3s ease',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '24px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  color: 'var(--text-white)',
                  marginBottom: '4px',
                }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📞 {r.phone}
                </div>
                {r.email && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ✉️ {r.email}
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: 'var(--secondary)', fontWeight: '600', marginBottom: '4px' }}>
                  📅 {formatDate(r.date)}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  🕐 {r.time} &nbsp;•&nbsp; 👥 {r.guests} guest{r.guests !== '1' ? 's' : ''}
                </div>
              </div>

              <div>
                {r.message && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{r.message}"
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Booked: {formatTimestamp(r.createdAt)}
                </div>
              </div>

              <div style={{
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
                background: r.status === 'confirmed'
                  ? 'rgba(45, 143, 45, 0.15)'
                  : r.status === 'cancelled'
                  ? 'rgba(200, 16, 46, 0.15)'
                  : 'rgba(212, 168, 83, 0.15)',
                color: r.status === 'confirmed'
                  ? '#4ade80'
                  : r.status === 'cancelled'
                  ? '#ff6b6b'
                  : 'var(--secondary)',
                border: `1px solid ${
                  r.status === 'confirmed'
                    ? 'rgba(45, 143, 45, 0.3)'
                    : r.status === 'cancelled'
                    ? 'rgba(200, 16, 46, 0.3)'
                    : 'var(--border-gold)'
                }`,
              }}>
                {r.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
