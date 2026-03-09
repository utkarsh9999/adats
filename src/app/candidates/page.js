'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Select from 'react-select'
import ProtectedRoute from '../../components/ProtectedRoute'
import { candidatesAPI } from '../../services/api'

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [selectedSkills, setSelectedSkills] = useState([])
  
  const candidatesPerPage = 5
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage)
  const indexOfLastCandidate = currentPage * candidatesPerPage
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate)

  // Skills options for search
  const skillsOptions = [
    { value: 'Java', label: 'Java' },
    { value: 'C#', label: 'C#' },
    { value: 'SQL', label: 'SQL' },
    { value: 'Python', label: 'Python' },
    { value: 'Endur (Openlink)', label: 'Endur (Openlink)' },
    { value: 'Allegro', label: 'Allegro' },
    { value: 'RightAngle', label: 'RightAngle' },
    { value: 'TriplePoint (ION)', label: 'TriplePoint (ION)' },
    { value: 'Aspect CTRM', label: 'Aspect CTRM' },
    { value: 'Enuit', label: 'Enuit' },
    { value: 'Brady CTRM', label: 'Brady CTRM' },
    { value: 'ETRM', label: 'ETRM' },
    { value: 'CTRM', label: 'CTRM' },
    { value: 'Physical Trading', label: 'Physical Trading' },
    { value: 'Derivatives Trading', label: 'Derivatives Trading' },
    { value: 'Risk Management', label: 'Risk Management' },
    { value: 'Market Risk (VaR)', label: 'Market Risk (VaR)' },
    { value: 'Credit Risk', label: 'Credit Risk' },
    { value: 'PnL Reporting', label: 'PnL Reporting' },
    { value: 'Trade Lifecycle Management', label: 'Trade Lifecycle Management' },
    { value: 'Hedging Strategies', label: 'Hedging Strategies' },
    { value: 'Deal Modeling', label: 'Deal Modeling' },
    { value: 'AVS / JVS (Endur)', label: 'AVS / JVS (Endur)' },
    { value: 'OpenJVS', label: 'OpenJVS' },
    { value: 'Report Builder', label: 'Report Builder' },
    { value: 'Interfaces & Integration', label: 'Interfaces & Integration' },
    { value: 'Data Migration', label: 'Data Migration' },
    { value: 'System Implementation', label: 'System Implementation' },
    { value: 'UAT Support', label: 'UAT Support' }
  ]

  useEffect(() => {
    loadCandidates()
  }, [])

  useEffect(() => {
    // Filter candidates based on selected skills
    if (selectedSkills.length === 0) {
      setFilteredCandidates(candidates)
    } else {
      const filtered = candidates.filter(candidate => {
        if (!candidate.skills || candidate.skills.length === 0) return false
        
        const candidateSkills = Array.isArray(candidate.skills) 
          ? candidate.skills 
          : (typeof candidate.skills === 'string' ? candidate.skills.split(',') : [])
        
        // Check if candidate has ALL selected skills
        return selectedSkills.every(selectedSkill => 
          candidateSkills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(selectedSkill.value.toLowerCase())
          )
        )
      })
      setFilteredCandidates(filtered)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [candidates, selectedSkills])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const data = await candidatesAPI.getAll()
      setCandidates(data)
      setFilteredCandidates(data)
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
      'offer': 'primary',
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
            
            {/* Skills Search Bar */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Filter by Skills</label>
                <Select
                  isMulti
                  name="skills"
                  options={skillsOptions}
                  value={selectedSkills}
                  onChange={setSelectedSkills}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select skills to filter candidates..."
                />
              </div>
            </div>
            
            <div className="table-responsive" id={"candidates-table"}>
              <table className="table align-middle mb-0 table-bordered" style={{minHeight:"auto"}}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '100px' }}>Name</th>
                    <th style={{ minWidth: '150px' }}>Email</th>
                    <th style={{ minWidth: '150px' }}>Phone</th>
                    <th style={{ minWidth: '250px' }}>Skills</th>
                    <th style={{ minWidth: '80px' }}>Status</th>
                    <th style={{ minWidth: '80px' }}>Location</th>
                    <th style={{ minWidth: '80px' }}>Company</th>
                    <th style={{ minWidth: '80px' }}>Experience</th>
                    <th style={{ minWidth: '150px' }}>Notice Period</th>
                    <th style={{ minWidth: '220px' }}>LinkedIn URL</th>
                    <th style={{ minWidth: '100px' }}>CTC (LPA)</th>
                    <th style={{ minWidth: '120px' }}>Expected CTC (LPA)</th>
                    <th className="text-center" id={"actions"}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-muted">No candidates yet.</td>
                    </tr>
                  ) : (
                    currentCandidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>{candidate.full_name || ''}</td>
                        <td>{candidate.email || ''}</td>
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
                        <td>{candidate.experience_years +' Years' || ''}</td>
                        <td>{candidate.notice_period ? (candidate.notice_period === 'immediate_notice' ? 'Immediate' : candidate.notice_period.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) : ''}</td>
                        <td>
                          {candidate.linkedin_url ? (
                            <a 
                              href={candidate.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              <i className="bi bi-linkedin"></i>{candidate.linkedin_url}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{candidate.ctc || ''}</td>
                        <td>{candidate.expected_ctc || ''}</td>
                        <td className="text-center" id={"actions"}>
                          <div className="btn-group" role="group">
                            <Link 
                              href={`/edit-candidate/${candidate.id}`} 
                              className="btn btn-success btn-sm"
                            >
                              Edit
                            </Link>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(candidate.id)}
                            >
                              Delete
                            </button>
                          </div>
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
