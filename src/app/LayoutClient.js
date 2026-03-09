'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function LayoutClient({ children }) {
  const [username, setUsername] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('username')
    const authStatus = localStorage.getItem('auth_logged_in')
    
    if (user && authStatus === 'true') {
      setUsername(user)
    } else {
      // Clear any inconsistent auth state
      localStorage.removeItem('username')
      localStorage.removeItem('auth_logged_in')
    }

    // Mark auth as checked
    setAuthChecked(true)

    // Initialize Bootstrap dropdowns
    if (typeof window !== 'undefined') {
      import('bootstrap').then((bootstrap) => {
        // Initialize all dropdowns
        const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]')
        dropdownElements.forEach(element => {
          new bootstrap.Dropdown(element)
        })
      })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('username')
    localStorage.removeItem('auth_logged_in')
    router.push('/login')
  }

  return (
    <>
      {pathname !== '/login' && authChecked && (
        <nav className="navbar navbar-expand-lg navbar-white bg-white fixed-top shadow-sm" style={{ marginBottom: '5rem' }}>
          <div className="container">
            <Link href="/dashboard" className="navbar-brand">
              ADATS
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav" 
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link href="/dashboard" className="nav-link">
                    Home
                  </Link>
                </li>
                {username && (
                  <li className="nav-item dropdown">
                    <a 
                      className="nav-link dropdown-toggle" 
                      href="#" 
                      id="candidatesDropdown" 
                      role="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      Candidates
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="candidatesDropdown">
                      <li>
                        <Link href="/candidates" className="dropdown-item">
                          Manage Candidates
                        </Link>
                      </li>
                      <li>
                        <Link href="/add-candidate" className="dropdown-item">
                          Add Candidate
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
              <ul className="navbar-nav ms-auto">
                {username ? (
                  <li className="nav-item dropdown">
                    <a 
                      className="nav-link dropdown-toggle" 
                      href="#" 
                      id="userDropdown" 
                      role="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      {username || 'User'}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <Link href="/settings" className="dropdown-item">
                          Settings
                        </Link>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={handleLogout}>
                          Logout
                        </a>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link href="/login" className="nav-link">
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      )}

      <main style={{ marginTop: pathname === '/login' ? '0' : (authChecked ? '80px' : '0') }}>
        {children}
      </main>
    </>
  )
}
