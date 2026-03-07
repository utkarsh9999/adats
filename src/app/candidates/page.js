'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import { candidatesAPI } from '../../services/api'

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCandidates, setTotalCandidates] = useState(0)
  
  const candidatesPerPage = 5
  const totalPages = Math.ceil(totalCandidates / candidatesPerPage)
  const indexOfLastCandidate = currentPage * candidatesPerPage
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
  const currentCandidates = candidates.slice(indexOfFirstCandidate, indexOfLastCandidate)

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const data = await candidatesAPI.getAll()
      setCandidates(data)
      setTotalCandidates(data.length)
    } catch (err) {
      setError(err.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'new': 'secondary',
      'screening': 'info',
      'shortlisted': 'primary',
      'interview': 'warning',
      'offer': 'success',
      'hired': 'success',
      'rejected': 'danger'
    }
    return statusColors[status] || 'secondary'
  }

  const handleDelete = async (id) => {
    console.log('Delete button clicked - candidate ID:', id)
    console.log('ID type:', typeof id)
    console.log('ID value:', id)
    console.log('Is valid number?', !isNaN(id) && id > 0)
    try {
      console.log('Calling delete API with ID:', id)
      
      // Remove from UI immediately for better UX
      setCandidates(prev => prev.filter(candidate => candidate.id !== id))
      
      // Call delete API (no refresh needed)
      await candidatesAPI.delete(id)
      
      console.log('Delete successful - no refresh needed')
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete candidate')
      // Reload candidates if delete failed to restore the deleted item
      await loadCandidates()
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <div>
            <h1 className="h3 mb-1">Candidates</h1>
            <div className="text-muted">Manage candidates list.</div>
          </div>
          <Link href="/add-candidate" className="btn btn-primary btn-sm">Add Candidate</Link>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ minWidth: '100px' }}>Name</th>
                    <th style={{ minWidth: '150px' }}>Email</th>
                    <th style={{ minWidth: '150px' }}>Phone</th>
                    <th style={{ minWidth: '250px' }}>Skills</th>
                    <th style={{ minWidth: '70px' }}>Status</th>
                    <th style={{ minWidth: '70px' }}>Location</th>
                    <th style={{ minWidth: '70px' }}>Company</th>
                    <th style={{ minWidth: '70px' }}>Experience</th>
                    <th style={{ minWidth: '170px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-muted">No candidates yet.</td>
                    </tr>
                  ) : (
                    currentCandidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>{candidate.full_name}</td>
                        <td>{candidate.email}</td>
                        <td>{candidate.phone || ''}</td>
                        <td>
                          {candidate.skills && candidate.skills.length > 0 ? (
                            candidate.skills.map((skill, index) => (
                              <span key={index} className="badge bg-success me-1">
                                {skill}
                              </span>
                            ))
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(candidate.candidate_status)}`}>
                            {candidate.candidate_status ? candidate.candidate_status.charAt(0).toUpperCase() + candidate.candidate_status.slice(1) : 'New'}
                          </span>
                        </td>
                        <td>{candidate.location || ''}</td>
                        <td>{candidate.current_company || ''}</td>
                        <td>{candidate.experience_years || ''}</td>
                        <td className="text-end">
                          <Link 
                            href={`/edit-candidate/${candidate.id}`} 
                            className="btn btn-success btn-sm me-1"
                          >
                            Edit
                          </Link>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(candidate.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalCandidates > candidatesPerPage && (
              <div className="text-center mt-3">
                <nav className="mb-3">
                  <ul className="pagination justify-content-center pagination-sm">
                    {/* Previous button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link btn-sm" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link btn-sm" 
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    
                    {/* Next button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link btn-sm" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
                <div className="text-muted">
                  Showing {indexOfFirstCandidate + 1} to {Math.min(indexOfLastCandidate, totalCandidates)} of {totalCandidates} candidates
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
