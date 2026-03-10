'use client'

import Link from 'next/link'

export default function LoggedInNavbar({ onLogout }) {
  return (
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
              <Link href="/dashboard" className="nav-link" style={{fontWeight:"bold"}}>
                Home
              </Link>
            </li>
            <li className="nav-item dropdown" style={{fontWeight:"bold"}}>
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
              <ul className="dropdown-menu" aria-labelledby="candidatesDropdown" style={{fontWeight:"bold"}}>
                <li>
                  <Link href="/candidates" className="dropdown-item" >
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
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="adminDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Admin
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                <li>
                  <Link href="/users" className="dropdown-item">
                    Manage Users
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="dropdown-item">
                    Settings
                  </Link>
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={onLogout}>
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
