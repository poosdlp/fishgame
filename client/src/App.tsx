import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Auth from './Auth'
import { apiUrl } from './api'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      if (token) {
        const response = await fetch(apiUrl('/api/auth/me'), {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setIsAuthenticated(true)
          return
        }
      }

      // Token missing or expired — try refresh cookie
      const refreshResponse = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include'
      })
      if (!refreshResponse.ok) return

      const { accessToken } = await refreshResponse.json()
      localStorage.setItem('accessToken', accessToken)

      const meResponse = await fetch(apiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include'
      })
      if (meResponse.ok) {
        const userData = await meResponse.json()
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      // Not authenticated
    }
  }

  const handleLogin = (token: string) => {
    localStorage.setItem('accessToken', token)
    setIsAuthenticated(true)
    checkAuthStatus() // Get user info
  }

  const handleLogout = async () => {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      // Ignore logout errors
    }
    localStorage.removeItem('accessToken')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <>
      <div className="header">
        <span>Welcome, {user?.username || user?.email}!</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Fish Game</h1>
          <p>
            Welcome to the fish game! You're authenticated.
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
