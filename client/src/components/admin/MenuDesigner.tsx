import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
  description: string
  image: string
  badge: string
  isVeg: boolean
  tags: string[]
  isAvailable: boolean
  isActive: boolean
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'starters', label: 'Starters' },
  { key: 'biryani', label: 'Biryani' },
  { key: 'mains', label: 'Main Course' },
  { key: 'chinese', label: 'Chinese' },
  { key: 'seafood', label: 'Seafood' },
  { key: 'veg', label: 'Vegetarian' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'beverages', label: 'Beverages' },
]

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'starters',
  description: '',
  image: '/chicken65.png',
  badge: '',
  isVeg: false,
  tags: '',
}

export default function MenuDesigner() {
  const { token } = useAuth()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setItems(data.data)
    } catch (err) {
      console.error('Menu fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description,
      image: form.image,
      badge: form.badge,
      isVeg: form.isVeg,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    try {
      const url = editingId
        ? `\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu/${editingId}`
        : `\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu`
      const method = editingId ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      fetchItems()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description,
      image: item.image || '',
      badge: item.badge || '',
      isVeg: item.isVeg,
      tags: item.tags?.join(', ') || '',
    })
    setEditingId(item._id)
    setShowForm(true)
  }

  const toggleAvailability = async (id: string) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchItems()
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Remove this item from the menu?')) return
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchItems()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading menu...</p></div>
  }

  return (
    <div className="menu-designer">
      <div className="menu-designer-header">
        <div className="menu-designer-filters">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className={`md-filter-btn ${filter === c.key ? 'active' : ''}`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button className="md-add-btn" onClick={() => {
          setForm(EMPTY_FORM)
          setEditingId(null)
          setShowForm(true)
        }}>
          ➕ Add Dish
        </button>
      </div>

      <div className="md-items-grid">
        {filtered.map(item => (
          <div key={item._id} className={`md-item-card ${!item.isAvailable ? 'unavailable' : ''} ${!item.isActive ? 'deleted' : ''}`}>
            <div className="md-item-top">
              <div className="md-item-img">
                <img src={item.image || '/chicken65.png'} alt={item.name} />
                {item.badge && <span className="md-item-badge">{item.badge}</span>}
                {item.isVeg && <span className="md-veg-badge">🟢</span>}
              </div>
              <div className="md-item-info">
                <h4>{item.name}</h4>
                <span className="md-item-price">₹{item.price}</span>
                <span className="md-item-category">{item.category}</span>
                <p className="md-item-desc">{item.description}</p>
                {item.tags?.length > 0 && (
                  <div className="md-item-tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="md-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="md-item-actions">
              <button className="md-btn-edit" onClick={() => startEdit(item)}>✏️ Edit</button>
              <button
                className={`md-btn-toggle ${item.isAvailable ? 'available' : 'unavailable'}`}
                onClick={() => toggleAvailability(item._id)}
              >
                {item.isAvailable ? '✅ Available' : '⛔ Unavailable'}
              </button>
              <button className="md-btn-delete" onClick={() => deleteItem(item._id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Dish' : '➕ Add New Dish'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="md-form">
              <div className="md-form-grid">
                <div className="md-form-field">
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Chicken Biryani"
                    required
                  />
                </div>
                <div className="md-form-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g., 280"
                    required
                    min="1"
                  />
                </div>
                <div className="md-form-field">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.filter(c => c.key !== 'all').map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md-form-field">
                  <label>Badge</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g., Bestseller, Popular"
                  />
                </div>
                <div className="md-form-field full-width">
                  <label>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the dish..."
                    required
                    rows={3}
                  />
                </div>
                <div className="md-form-field">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g., Spicy, Crispy"
                  />
                </div>
                <div className="md-form-field">
                  <label>Image Path</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    placeholder="/chicken65.png"
                  />
                </div>
                <div className="md-form-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.isVeg}
                      onChange={e => setForm({ ...form, isVeg: e.target.checked })}
                    />
                    <span>Vegetarian</span>
                  </label>
                </div>
              </div>
              <div className="md-form-actions">
                <button type="button" className="md-form-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="md-form-submit" disabled={saving}>
                  {saving ? '⏳ Saving...' : editingId ? '💾 Update Dish' : '➕ Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
