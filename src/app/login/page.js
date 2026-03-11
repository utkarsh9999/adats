'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toast, ToastContainer } from 'react-bootstrap'
import { authAPI } from '../../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorToastMessage, setErrorToastMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const authStatus = localStorage.getItem('auth_logged_in')
    const username = localStorage.getItem('username')
    
    if (authStatus === 'true' && username) {
      router.push('/dashboard')
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await authAPI.login(username, password)
      setShowSuccessToast(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.'
      setError(msg)
      setErrorToastMessage(msg)
      setShowErrorToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '0 15px' }}>
        <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
          <Toast bg="success" onClose={() => setShowSuccessToast(false)} show={showSuccessToast} delay={2000} autohide>
            <Toast.Header closeButton>
              <strong className="me-auto">Success</strong>
            </Toast.Header>
            <Toast.Body className="text-white">Login successful. Redirecting...</Toast.Body>
          </Toast>

          <Toast bg="danger" onClose={() => setShowErrorToast(false)} show={showErrorToast} delay={2000} autohide>
            <Toast.Header closeButton>
              <strong className="me-auto">Error</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{errorToastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="h3 mb-1">ADATS</h2>
                <div className="text-muted">Candidate Management System</div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 btn-sm" disabled={isSubmitting}>
                  Login
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
