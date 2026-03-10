'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LoggedInNavbar from '../components/LoggedInNavbar'

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
      setUsername('')
      // Clear any inconsistent auth state
      localStorage.removeItem('username')
      localStorage.removeItem('auth_logged_in')
    }

    // Mark auth as checked
    setAuthChecked(true)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('username')
    localStorage.removeItem('auth_logged_in')
    router.push('/login')
  }

  const showNavbar = pathname !== '/login' && authChecked && !!username

  useEffect(() => {
    if (!showNavbar) return
    if (typeof window === 'undefined') return

    import('bootstrap').then((bootstrap) => {
      const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]')
      dropdownElements.forEach(element => {
        new bootstrap.Dropdown(element)
      })
    })
  }, [showNavbar])

  return (
    <>
      {showNavbar && (
        <LoggedInNavbar onLogout={handleLogout} />
      )}

      <main style={{ marginTop: showNavbar ? '80px' : '0' }}>
        {children}
      </main>
    </>
  )
}
