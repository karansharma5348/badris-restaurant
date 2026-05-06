import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'superadmin'
  fullName: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('badri_token'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
        } else {
          localStorage.removeItem('badri_token')
          setToken(null)
        }
      } catch {
        localStorage.removeItem('badri_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [token])

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem('badri_token', data.data.token)
        return { success: true, message: 'Login successful' }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: 'Could not connect to server.' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('badri_token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      isSuperAdmin: user?.role === 'superadmin',
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
