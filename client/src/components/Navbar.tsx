import { useState } from 'react'

interface NavbarProps {
  scrolled: boolean
  showReservations?: boolean
}

export default function Navbar({ scrolled, showReservations }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLinkClick = () => {
    setMobileOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" onClick={handleLinkClick}>
          <div className="navbar-logo-icon">B</div>
          <div className="navbar-logo-text">
            Badri<span>'s</span>
          </div>
        </a>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {showReservations ? (
            <>
              <a href="/" onClick={handleLinkClick}>← Back to Website</a>
            </>
          ) : (
            <>
              <a href="#about" onClick={handleLinkClick}>About</a>
              <a href="#specialties" onClick={handleLinkClick}>Specialties</a>
              <a href="#menu" onClick={handleLinkClick}>Menu</a>
              <a href="#reviews" onClick={handleLinkClick}>Reviews</a>
              <a href="#info" onClick={handleLinkClick}>Visit Us</a>
              <a href="/login" onClick={handleLinkClick} style={{ color: 'var(--secondary)' }}>🔐 Admin</a>
              <a href="#contact" className="navbar-cta" onClick={handleLinkClick}>Reserve Table</a>
            </>
          )}
        </div>

        <button
          className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
