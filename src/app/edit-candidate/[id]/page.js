'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Select from 'react-select'
import { candidatesAPI } from '../../../services/api'

export default function EditCandidate() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    skills: [],
    linkedin_url: '',
    resume: '',
    candidate_status: 'new',
    location: '',
    current_company: '',
    current_job_title: '',
    experience_years: '',
    notice_period: '',
    ctc: '',
    expected_ctc: '',
    employment_type: '',
    notes: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [candidateId, setCandidateId] = useState(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const skillsOptions = [
    { value: 'Java', label: 'Java' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'React', label: 'React' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'SQL', label: 'SQL' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Docker', label: 'Docker' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Git', label: 'Git' },
    { value: 'REST API', label: 'REST API' },
    { value: 'GraphQL', label: 'GraphQL' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'HTML/CSS', label: 'HTML/CSS' },
    { value: 'CTRM', label: 'CTRM' },
    { value: 'Endur', label: 'Endur' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Agile', label: 'Agile' },
    { value: 'Scrum', label: 'Scrum' }
  ]

  useEffect(() => {
    if (id) {
      loadCandidate(id)
    }
  }, [id])

  const loadCandidate = async (id) => {
    try {
      setLoading(true)
      const data = await candidatesAPI.getById(id)
      
      // Set form data with loaded candidate data
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        skills: data.skills || [],
        linkedin_url: data.linkedin_url || '',
        resume: data.resume || '',
        candidate_status: data.candidate_status || 'new',
        location: data.location || '',
        current_company: data.current_company || '',
        current_job_title: data.current_job_title || '',
        experience_years: data.experience_years || '',
        notice_period: data.notice_period || '',
        ctc: data.ctc || '',
        expected_ctc: data.expected_ctc || '',
        employment_type: data.employment_type || '',
        notes: data.notes || ''
      })
      setCandidateId(data.id)
    } catch (err) {
      setError(err.message || 'Failed to load candidate')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillsChange = (selectedOptions) => {
    console.log('Skills change selectedOptions:', selectedOptions)
    const skillsArray = selectedOptions ? selectedOptions.map(option => option.value) : []
    console.log('Skills array:', skillsArray)
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.email) {
      setError('Name and email are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Ensure skills is an array (handle both array and string formats)
      let skillsArray = []
      if (Array.isArray(formData.skills)) {
        skillsArray = formData.skills
      } else if (typeof formData.skills === 'string' && formData.skills.trim()) {
        // If it's a string, split by comma and clean up
        skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      } else if (formData.skills) {
        // Fallback: convert to string and split
        skillsArray = String(formData.skills).split(',').map(skill => skill.trim()).filter(skill => skill)
      }
      
      // Prepare data for API
      const candidateData = {
        ...formData,
        skills: skillsArray
      }
      
      console.log('Updating candidate data:', candidateData)
      console.log('Skills data type:', typeof candidateData.skills)
      console.log('Is skills array?', Array.isArray(candidateData.skills))

      // Update candidate via API
      await candidatesAPI.update(candidateId, candidateData)
      
      setSuccess(
        <div>
          Candidate updated successfully! 
          <Link href="/candidates" className="alert-link ms-2">
            View Candidates →
          </Link>
        </div>
      )
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        skills: [],
        linkedin_url: '',
        resume: '',
        candidate_status: 'new',
        location: '',
        current_company: '',
        current_job_title: '',
        experience_years: '',
        notice_period: '',
        ctc: '',
        expected_ctc: '',
        employment_type: '',
        notes: ''
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update candidate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading candidate...</span>
            </div>
          </div>
        </div>
        </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-1">Edit Candidate</h4>
                    <div className="text-muted">Update candidate information.</div>
                  </div>
                  <Link href="/candidates" className="btn btn-secondary btn-sm">
                    ← Back to Candidates
                  </Link>
                </div>

                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Name, Email, Phone - 3 columns */}
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Phone *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    {/* LinkedIn URL - Full width */}
                    <div className="col-12 mb-3">
                      <label className="form-label">LinkedIn URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    {/* Skills - Full width */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Skills</label>
                      <Select
                        isMulti
                        name="skills"
                        options={skillsOptions}
                        value={formData.skills}
                        onChange={handleSkillsChange}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select skills..."
                      />
                    </div>

                    {/* Resume - Full width */}
                    <div className="col-3 mb-3">
                      <label className="form-label">Resume</label>
                      <input
                        type="text"
                        className="form-control"
                        name="resume"
                        value={formData.resume}
                        onChange={handleInputChange}
                        placeholder="Resume file path or URL"
                      />
                    </div>

                    {/* Status and Location - 2 columns */}
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Candidate Status</label>
                      <Select
                        name="candidate_status"
                        options={[
                          { value: 'new', label: 'New' },
                          { value: 'screening', label: 'Screening' },
                          { value: 'shortlisted', label: 'Shortlisted' },
                          { value: 'interview', label: 'Interview' },
                          { value: 'offer', label: 'Offer' },
                          { value: 'hired', label: 'Hired' },
                          { value: 'rejected', label: 'Rejected' }
                        ]}
                        value={formData.candidate_status ? { value: formData.candidate_status, label: formData.candidate_status.charAt(0).toUpperCase() + formData.candidate_status.slice(1) } : null}
                        onChange={(selectedOption) => {
                          setFormData(prev => ({
                            ...prev,
                            candidate_status: selectedOption ? selectedOption.value : ''
                          }))
                        }}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select status..."
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Location</label>
                      <Select
                        name="location"
                        options={[
                          { value: 'Remote (India)', label: 'Remote (India)' },
                          { value: 'Bengaluru', label: 'Bengaluru' },
                          { value: 'Hyderabad', label: 'Hyderabad' },
                          { value: 'Mumbai', label: 'Mumbai' },
                          { value: 'Chennai', label: 'Chennai' },
                          { value: 'Delhi', label: 'Delhi' },
                          { value: 'Noida', label: 'Noida' },
                          { value: 'Gurugram', label: 'Gurugram' }
                        ]}
                        value={formData.location ? { value: formData.location, label: formData.location } : null}
                        onChange={(selectedOption) => {
                          setFormData(prev => ({
                            ...prev,
                            location: selectedOption ? selectedOption.value : ''
                          }))
                        }}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select location..."
                      />
                    </div>

                    {/* Current Company, Job Title, Experience, Notice Period - 4 columns */}
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Current Company</label>
                      <input
                        type="text"
                        className="form-control"
                        name="current_company"
                        value={formData.current_company}
                        onChange={handleInputChange}
                        placeholder="Enter current company"
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Current Job Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="current_job_title"
                        value={formData.current_job_title}
                        onChange={handleInputChange}
                        placeholder="Enter current job title"
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Experience (Years)</label>
                      <Select
                        name="experience_years"
                        options={[
                          { value: '0-3', label: '0-3 Years' },
                          { value: '4-7', label: '4-7 Years' },
                          { value: '7-10', label: '7-10 Years' },
                          { value: '10+', label: '10+ Years' }
                        ]}
                        value={formData.experience_years ? { value: formData.experience_years, label: formData.experience_years.replace('_', '-') + ' Years' } : null}
                        onChange={(selectedOption) => {
                          setFormData(prev => ({
                            ...prev,
                            experience_years: selectedOption ? selectedOption.value : ''
                          }))
                        }}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select experience..."
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Notice Period</label>
                      <Select
                        name="notice_period"
                        options={[
                          { value: 'immediate', label: 'Immediate' },
                          { value: '15_days', label: '15 Days' },
                          { value: '30_days', label: '30 Days' },
                          { value: '60_days', label: '60 Days' },
                          { value: '90_days', label: '90 Days' }
                        ]}
                        value={formData.notice_period ? { value: formData.notice_period, label: formData.notice_period.replace('_', ' ').charAt(0).toUpperCase() + formData.notice_period.replace('_', ' ').slice(1) } : null}
                        onChange={(selectedOption) => {
                          setFormData(prev => ({
                            ...prev,
                            notice_period: selectedOption ? selectedOption.value : ''
                          }))
                        }}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select notice period..."
                      />
                    </div>

                    {/* CTC, Expected CTC, Employment Type - 3 columns */}
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">CTC (LPA)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ctc"
                        value={formData.ctc}
                        onChange={handleInputChange}
                        placeholder="Current CTC"
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Expected CTC (LPA)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="expected_ctc"
                        value={formData.expected_ctc}
                        onChange={handleInputChange}
                        placeholder="Expected CTC"
                      />
                    </div>
                    <div className="col-3 col-md-3 mb-3">
                      <label className="form-label">Employment Type</label>
                      <Select
                        name="employment_type"
                        options={[
                          { value: 'full_time', label: 'Full-time' },
                          { value: 'contract', label: 'Contract' },
                          { value: 'internship', label: 'Internship' }
                        ]}
                        value={formData.employment_type ? { value: formData.employment_type, label: formData.employment_type.replace('_', '-').charAt(0).toUpperCase() + formData.employment_type.replace('_', '-').slice(1) } : null}
                        onChange={(selectedOption) => {
                          setFormData(prev => ({
                            ...prev,
                            employment_type: selectedOption ? selectedOption.value : ''
                          }))
                        }}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select employment type..."
                      />
                    </div>

                    {/* Notes - Full width */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Add any additional notes about the candidate..."
                        style={{ resize: 'none' }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-primary float-end btn-sm" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Candidate'
                        )}
                      </button>
                      <Link href="/candidates" className="btn btn-secondary btn-sm me-2">
                        Cancel
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}