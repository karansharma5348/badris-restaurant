export default function Info() {
  return (
    <section className="info" id="info">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Plan Your Visit</span>
          <h2 className="section-title">Visit Us</h2>
          <div className="divider"></div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-icon">📍</div>
            <h3>Location</h3>
            <p>
              <span className="highlight-text">Chembur, Mumbai</span><br />
              Maharashtra, India<br /><br />
              Easy access from Chembur Railway Station.<br />
              Ample parking available nearby.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">🕐</div>
            <h3>Opening Hours</h3>
            <p>
              <span className="highlight-text">Monday — Sunday</span><br />
              12:00 PM — 1:00 AM<br /><br />
              <strong style={{ color: '#e0e0e0' }}>Lunch:</strong> 12:00 PM – 4:00 PM<br />
              <strong style={{ color: '#e0e0e0' }}>Dinner:</strong> 7:00 PM – 1:00 AM
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">🍽️</div>
            <h3>Services</h3>
            <p>
              <span className="highlight-text">Dine-in · Takeaway · Delivery</span><br /><br />
              Family-friendly seating<br />
              Available on Swiggy & Zomato<br />
              Group bookings welcome
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
