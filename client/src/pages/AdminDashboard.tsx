import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminOverview from '../components/admin/AdminOverview'
import GanttChart from '../components/admin/GanttChart'
import PreOrderManager from '../components/admin/PreOrderManager'
import MenuDesigner from '../components/admin/MenuDesigner'
import MessagesList from '../components/admin/MessagesList'
import Analytics from '../components/superadmin/Analytics'

const tabs = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'gantt', label: 'Reservations', icon: '📅' },
  { key: 'preorders', label: 'Pre-Orders', icon: '🍽️' },
  { key: 'menu', label: 'Menu Manager', icon: '📋' },
  { key: 'messages', label: 'Messages', icon: '📨' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />
      case 'gantt': return <GanttChart />
      case 'preorders': return <PreOrderManager />
      case 'menu': return <MenuDesigner />
      case 'messages': return <MessagesList />
      case 'analytics': return <Analytics />
      default: return <AdminOverview />
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">🍽️</span>
            {!sidebarCollapsed && <span className="sidebar-title">Badri's Admin</span>}
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
            <div className="sidebar-avatar">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.fullName || user?.username}</span>
                <span className="sidebar-user-role">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-actions">
              {user?.role === 'superadmin' && (
                <a href="/superadmin" className="sidebar-link">Super Admin Panel →</a>
              )}
              <a href="/" className="sidebar-link">← Back to Website</a>
              <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {tabs.find(t => t.key === activeTab)?.icon}{' '}
              {tabs.find(t => t.key === activeTab)?.label}
            </h1>
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
