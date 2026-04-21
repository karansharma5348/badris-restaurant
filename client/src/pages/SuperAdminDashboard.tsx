import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import SystemOverview from '../components/superadmin/SystemOverview'
import TicketSystem from '../components/superadmin/TicketSystem'
import Analytics from '../components/superadmin/Analytics'
import AdminManager from '../components/superadmin/AdminManager'

const tabs = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'admins', label: 'Admin Users', icon: '👥' },
  { key: 'tickets', label: 'Tickets', icon: '🎫' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
]

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <SystemOverview />
      case 'admins': return <AdminManager />
      case 'tickets': return <TicketSystem />
      case 'analytics': return <Analytics />
      default: return <SystemOverview />
    }
  }

  return (
    <div className="dashboard-layout superadmin">
      <aside className={`dashboard-sidebar superadmin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">👑</span>
            {!sidebarCollapsed && <span className="sidebar-title">Super Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`sidebar-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              title={tab.label}
            >
              <span className="sidebar-nav-icon">{tab.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-nav-label">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar sa-avatar">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.fullName || user?.username}</span>
                <span className="sidebar-user-role sa-role">Super Admin</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-actions">
              <a href="/admin" className="sidebar-link">Admin Dashboard →</a>
              <a href="/" className="sidebar-link">← Back to Website</a>
              <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar superadmin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {tabs.find(t => t.key === activeTab)?.icon}{' '}
              {tabs.find(t => t.key === activeTab)?.label}
            </h1>
            <span className="sa-badge">SUPER ADMIN</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
