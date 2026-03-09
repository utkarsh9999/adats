'use client'

import { useState, useEffect } from 'react'
import { Container, Card, Row, Col } from 'react-bootstrap'
import ProtectedRoute from '../../components/ProtectedRoute'
import { candidatesAPI } from '../../services/api'

export default function Dashboard() {
  const [username, setUsername] = useState('user')
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [newCandidates, setNewCandidates] = useState(0)
  const [interviewCandidates, setInterviewCandidates] = useState(0)
  const [hiredCandidates, setHiredCandidates] = useState(0)

  useEffect(() => {
    // Get username from localStorage
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
    
    // Fetch candidates statistics
    fetchCandidatesStats()
  }, [])

  const fetchCandidatesStats = async () => {
    try {
      const candidates = await candidatesAPI.getAll()
      
      // Calculate statistics
      const total = candidates.length
      const newCandidates = candidates.filter(c => c.candidate_status === 'new').length
      const interviewCandidates = candidates.filter(c => c.candidate_status === 'interview').length
      const hiredCandidates = candidates.filter(c => c.candidate_status === 'hired').length
      
      setTotalCandidates(total)
      setNewCandidates(newCandidates)
      setInterviewCandidates(interviewCandidates)
      setHiredCandidates(hiredCandidates)
    } catch (error) {
      console.error('Failed to fetch candidates stats:', error)
    }
  }

  return (
    <ProtectedRoute>
      <Container>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <div className="text-muted">Welcome back, {username}!</div>
        </div>
      </div>

      <Row>
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="h4 text-primary">{totalCandidates}</h2>
              <p className="text-muted mb-0">Total Candidates</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="h4 text-success">{newCandidates}</h2>
              <p className="text-muted mb-0">New Candidates</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="h4 text-warning">{interviewCandidates}</h2>
              <p className="text-muted mb-0">In Interview</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="h4 text-info">{hiredCandidates}</h2>
              <p className="text-muted mb-0">Hired</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Recent Activity</h5>
          <div className="text-muted">
            No recent activity to display.
          </div>
        </Card.Body>
      </Card>
    </Container>
    </ProtectedRoute>
  )
}
