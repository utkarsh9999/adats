'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Select from 'react-select'
import { candidatesAPI } from '../../services/api'

export default function AddCandidate() {
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
  const router = useRouter()

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
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validation
      if (!formData.full_name || !formData.email) {
        setError('Full Name and Email are required fields.')
        return
      }

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
      
      console.log('Submitting candidate data:', candidateData)
      console.log('Skills data type:', typeof candidateData.skills)
      console.log('Skills data value:', candidateData.skills)
      console.log('Is skills array?', Array.isArray(candidateData.skills))

      // Create new candidate via API
      const newCandidate = await candidatesAPI.create(candidateData)
      
      setSuccess(
        <div>
          Candidate added successfully! 
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
      console.error('Submit error:', err)
      setError(err.message || 'Failed to add candidate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <div>
            <h1 className="h3 mb-1">Add Candidate</h1>
            <div className="text-muted">Add a new candidate to the system.</div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Name, Email, Phone - 3 columns */}
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
                  options={[
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
                  ]}
                  value={Array.isArray(formData.skills) 
                    ? formData.skills.map(skill => ({ value: skill, label: skill }))
                    : []
                  }
                  onChange={handleSkillsChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select skills..."
                />
              </div>

              {/* LinkedIn and Resume - 2 columns */}
              
              <div className="col-lg-3 col-md-12 mb-3">
                <label className="form-label">Resume</label>
                <input
                  type="text"
                  className="form-control"
                  name="resume"
                  value={formData.resume}
                  onChange={handleInputChange}
                  placeholder="Resume (Google Drive) URL"
                />
              </div>

              {/* Status and Location - 2 columns */}
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
              <div className="col-lg-3 col-md-12 mb-3">
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
                      Saving...
                    </>
                  ) : (
                    'Save Candidate'
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
    </ProtectedRoute>
  )
}
