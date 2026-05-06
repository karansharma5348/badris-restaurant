import { useState, useEffect } from 'react'

interface MenuItemForOrder {
  _id: string
  name: string
  price: number
  category: string
  isVeg: boolean
}

interface PreOrderItem {
  menuItem: string
  name: string
  price: number
  quantity: number
}

export default function Contact() {
  const [step, setStep] = useState<'details' | 'preorder' | 'done'>('details')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '2',
    message: '',
  })
  const [menuItems, setMenuItems] = useState<MenuItemForOrder[]>([])
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu`)
      const data = await res.json()
      if (data.success) setMenuItems(data.data)
    } catch {
      // Silently fail
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('preorder')
  }

  const addToOrder = (item: MenuItemForOrder) => {
    const existing = preOrderItems.find(p => p.menuItem === item._id)
    if (existing) {
      setPreOrderItems(preOrderItems.map(p =>
        p.menuItem === item._id ? { ...p, quantity: p.quantity + 1 } : p
      ))
    } else {
      setPreOrderItems([...preOrderItems, {
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
      }])
    }
  }

  const removeFromOrder = (menuItemId: string) => {
    const existing = preOrderItems.find(p => p.menuItem === menuItemId)
    if (existing && existing.quantity > 1) {
      setPreOrderItems(preOrderItems.map(p =>
        p.menuItem === menuItemId ? { ...p, quantity: p.quantity - 1 } : p
      ))
    } else {
      setPreOrderItems(preOrderItems.filter(p => p.menuItem !== menuItemId))
    }
  }

  const getQuantity = (id: string) => {
    return preOrderItems.find(p => p.menuItem === id)?.quantity || 0
  }

  const orderTotal = preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        setResultMessage(data.message)
      } else {
        setResultMessage('Reservation created! We will contact you shortly.')
      }
    } catch {
      setResultMessage('Reservation submitted! We will contact you shortly.')
    }

    setStep('done')
    setSubmitting(false)
    // Reset after 8 seconds
    setTimeout(() => {
      setStep('details')
      setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '2', message: '' })
      setPreOrderItems([])
      setResultMessage('')
    }, 8000)
  }

  // Group menu items by category
  const categories = [...new Set(menuItems.map(i => i.category))]

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Book a Table</span>
          <h2 className="section-title">Reserve Your Spot</h2>
          <div className="divider"></div>
          <p className="section-desc">
            Planning a family dinner or a special celebration? Reserve your table
            at Badri's and even pre-order your food!
          </p>
        </div>

        <div className="contact-form-wrapper">
          {/* Step Indicator */}
          <div className="reservation-steps">
            <div className={`res-step ${step === 'details' ? 'active' : step !== 'details' ? 'completed' : ''}`}>
              <span className="res-step-num">1</span>
              <span className="res-step-label">Details</span>
            </div>
            <div className="res-step-line"></div>
            <div className={`res-step ${step === 'preorder' ? 'active' : step === 'done' ? 'completed' : ''}`}>
              <span className="res-step-num">2</span>
              <span className="res-step-label">Pre-Order</span>
            </div>
            <div className="res-step-line"></div>
            <div className={`res-step ${step === 'done' ? 'active' : ''}`}>
              <span className="res-step-num">3</span>
              <span className="res-step-label">Confirmed</span>
            </div>
          </div>

          {/* Step 1: Details */}
          {step === 'details' && (
            <form className="contact-form" onSubmit={handleDetailsSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Guests</label>
                <select id="guests" name="guests" value={formData.guests} onChange={handleChange}>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                  <option value="6">6 People</option>
                  <option value="7+">7+ People</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="message">Special Requests</label>
                <textarea id="message" name="message" placeholder="Any dietary requirements or special occasion?" value={formData.message} onChange={handleChange} />
              </div>
              <button type="submit" className="submit-btn">
                Next: Pre-Order Food →
              </button>
            </form>
          )}

          {/* Step 2: Pre-Order */}
          {step === 'preorder' && (
            <div className="preorder-step">
              <div className="preorder-header">
                <h3>🍽️ Pre-Order Your Food</h3>
                <p>Select items to have them ready when you arrive. You can also skip this step.</p>
              </div>

              {menuItems.length > 0 ? (
                <div className="preorder-menu">
                  {categories.map(cat => (
                    <div key={cat} className="preorder-category">
                      <h4 className="preorder-cat-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
                      <div className="preorder-items-list">
                        {menuItems.filter(i => i.category === cat).map(item => {
                          const qty = getQuantity(item._id)
                          return (
                            <div key={item._id} className={`preorder-menu-item ${qty > 0 ? 'selected' : ''}`}>
                              <div className="pmi-info">
                                <span className="pmi-veg">{item.isVeg ? '🟢' : '🔴'}</span>
                                <span className="pmi-name">{item.name}</span>
                                <span className="pmi-price">₹{item.price}</span>
                              </div>
                              <div className="pmi-controls">
                                {qty > 0 && (
                                  <button className="pmi-btn minus" onClick={() => removeFromOrder(item._id)}>−</button>
                                )}
                                {qty > 0 && <span className="pmi-qty">{qty}</span>}
                                <button className="pmi-btn plus" onClick={() => addToOrder(item)}>+</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  Menu not available for pre-ordering. Please connect to the server.
                </p>
              )}

              {/* Order Summary */}
              {preOrderItems.length > 0 && (
                <div className="preorder-summary">
                  <h4>📋 Your Pre-Order</h4>
                  {preOrderItems.map(item => (
                    <div key={item.menuItem} className="pos-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pos-total">
                    <span>Total</span>
                    <span>₹{orderTotal}</span>
                  </div>
                </div>
              )}

              <div className="preorder-actions">
                <button className="preorder-back-btn" onClick={() => setStep('details')}>
                  ← Back
                </button>
                <button className="preorder-skip-btn" onClick={handleFinalSubmit} disabled={submitting}>
                  {preOrderItems.length === 0 ? 'Skip & Confirm' : '🍽️ Confirm Reservation & Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                color: 'var(--text-white)',
                marginBottom: '8px',
              }}>
                {preOrderItems.length > 0 ? 'Reservation & Pre-Order Confirmed!' : 'Reservation Confirmed!'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>
                {resultMessage || 'Thank you! Check your email for confirmation details.'}
              </p>
              {preOrderItems.length > 0 && (
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
                  🍽️ Your food will be prepared as you arrive!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
