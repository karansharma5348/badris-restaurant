import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface AdminUser {
  _id: string
  username: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminManager() {
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'admin' as 'admin' | 'superadmin',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (err) {
      console.error('Fetch users failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ username: '', email: '', fullName: '', password: '', role: 'admin' })
    setEditingUser(null)
    setFormError('')
    setFormSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!formData.username || !formData.email || !formData.fullName) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!editingUser && !formData.password) {
      setFormError('Password is required for new users.')
      return
    }

    try {
      const url = editingUser
        ? `\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${editingUser._id}`
        : `\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`

      const method = editingUser ? 'PUT' : 'POST'

      const body: any = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
      }
      if (formData.password) body.password = formData.password

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        setFormSuccess(editingUser ? 'Admin updated successfully!' : 'Admin created successfully!')
        fetchUsers()
        setTimeout(() => {
          setShowForm(false)
          resetForm()
        }, 1500)
      } else {
        setFormError(data.message || 'Operation failed.')
      }
    } catch (err) {
      setFormError('Server connection failed.')
    }
  }

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchUsers()
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const startEdit = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      password: '',
      role: user.role as 'admin' | 'superadmin',
    })
    setShowForm(true)
    setFormError('')
    setFormSuccess('')
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading admin users...</p></div>
  }

  return (
    <div className="admin-manager">
      <div className="admin-manager-header">
        <div>
          <h2 className="admin-manager-title">👥 Admin Management</h2>
          <p className="admin-manager-subtitle">Manage admin and super admin accounts</p>
        </div>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? '✕ Cancel' : '+ Add Admin'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="admin-form-card">
          <h3>{editingUser ? '✏️ Edit Admin' : '➕ Create New Admin'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            {formError && <div className="admin-form-error">⚠️ {formError}</div>}
            {formSuccess && <div className="admin-form-success">✅ {formSuccess}</div>}
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="admin-form-field">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="admin-form-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="admin-form-field">
                <label>{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                />
              </div>
              <div className="admin-form-field">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'superadmin' })}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn">
                {editingUser ? '💾 Update Admin' : '➕ Create Admin'}
              </button>
              <button type="button" className="admin-cancel-btn" onClick={() => { setShowForm(false); resetForm() }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="admin-users-grid">
        {users.map(user => (
          <div key={user._id} className={`admin-user-card ${!user.isActive ? 'inactive' : ''}`}>
            <div className="admin-user-card-header">
              <div className="admin-user-avatar" style={{
                background: user.role === 'superadmin'
                  ? 'linear-gradient(135deg, #d4a853, #e8c878)'
                  : 'linear-gradient(135deg, #3b82f6, #60a5fa)'
              }}>
                {user.fullName?.charAt(0) || user.username.charAt(0)}
              </div>
              <div className="admin-user-meta">
                <strong>{user.fullName || user.username}</strong>
                <span className={`admin-role-badge ${user.role}`}>
                  {user.role === 'superadmin' ? '👑 Super Admin' : '🛡️ Admin'}
                </span>
              </div>
              <div className={`admin-status-dot ${user.isActive ? 'active' : 'inactive'}`}
                title={user.isActive ? 'Active' : 'Inactive'} />
            </div>
            <div className="admin-user-details">
              <div className="admin-user-detail">
                <span className="admin-detail-label">Username</span>
                <span className="admin-detail-value">@{user.username}</span>
              </div>
              <div className="admin-user-detail">
                <span className="admin-detail-label">Email</span>
                <span className="admin-detail-value">{user.email}</span>
              </div>
              <div className="admin-user-detail">
                <span className="admin-detail-label">Created</span>
                <span className="admin-detail-value">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="admin-user-actions">
              <button className="admin-edit-btn" onClick={() => startEdit(user)}>✏️ Edit</button>
              <button
                className={`admin-toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                onClick={() => toggleActive(user._id, user.isActive)}
              >
                {user.isActive ? '🚫 Deactivate' : '✅ Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="admin-no-users">
          <p>No admin users found. Create one to get started.</p>
        </div>
      )}
    </div>
  )
}
