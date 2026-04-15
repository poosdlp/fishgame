import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import Auth from './Auth'
import VerifyEmail from './VerifyEmail'
import ResetPassword from './ResetPassword'
import ForgotPassword from './ForgotPassword'
import QRCodePopup from './QRCode'
import { apiUrl } from './api'

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  showQR: boolean
  setShowQR: (show: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)

  const token = isAuthenticated ? localStorage.getItem('accessToken') : null

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      const response = await fetch(apiUrl('/api/profile/me'), {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch {
      // Not authenticated
    }
  }, [])

  useEffect(() => {
    checkAuthStatus().finally(() => setLoading(false))
  }, [checkAuthStatus])

  const handleLogin = (token: string) => {
    localStorage.setItem('accessToken', token)
    setIsAuthenticated(true)
    checkAuthStatus()
  }

  const logout = async () => {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('accessToken')
    setIsAuthenticated(false)
    setUser(null)
  }

  // Handle auth-related routes before anything else
  const path = window.location.pathname
  if (path === '/verify-email') return <VerifyEmail />
  if (path === '/reset-password') return <ResetPassword />
  if (path === '/forgot-password') return <ForgotPassword />

  if (loading) return null

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, logout, showQR, setShowQR }}>
      <div className="header">
        <span>Welcome, {user?.username || user?.email}!</span>
        <button onClick={logout}>Logout</button>
      </div>
      {children}
    </AuthContext.Provider>
  )
}
